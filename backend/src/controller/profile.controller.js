import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import User from '../model/user.model.js';
import Article from '../model/article.model.js';
import GenImg from '../model/image.model.js';
import Blogtitle from '../model/blogtitle.model.js';
import RemoveBG from '../model/removeBG.model.js';

// Get user profile with usage statistics
const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Calculate usage statistics
    const [articleCount, imageCount, titleCount, bgRemovalCount] = await Promise.all([
        Article.countDocuments({ user: userId }),
        GenImg.countDocuments({ user: userId }),
        Blogtitle.countDocuments({ user: userId }),
        RemoveBG.countDocuments({ user: userId })
    ]);

    const totalGenerations = articleCount + imageCount + titleCount + bgRemovalCount;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Promise.all([
        Article.countDocuments({ user: userId, createdAt: { $gte: thirtyDaysAgo } }),
        GenImg.countDocuments({ user: userId, createdAt: { $gte: thirtyDaysAgo } }),
        Blogtitle.countDocuments({ user: userId, createdAt: { $gte: thirtyDaysAgo } }),
        RemoveBG.countDocuments({ user: userId, createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const profile = {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            joinDate: user.createdAt,
            lastActive: user.updatedAt
        },
        usage: {
            articles: articleCount,
            images: imageCount,
            titles: titleCount,
            backgroundRemovals: bgRemovalCount,
            total: totalGenerations
        },
        recentActivity: {
            articles: recentActivity[0],
            images: recentActivity[1],
            titles: recentActivity[2],
            backgroundRemovals: recentActivity[3],
            total: recentActivity.reduce((sum, count) => sum + count, 0)
        },
        limits: {
            articles: { used: articleCount, total: 100 },
            images: { used: imageCount, total: 50 },
            titles: { used: titleCount, total: 200 },
            backgroundRemovals: { used: bgRemovalCount, total: 30 }
        }
    };

    console.log("🔍 Backend - Sending profile data:", JSON.stringify(profile, null, 2));
    res.status(200).json(new ApiResponse(200, 'Profile fetched successfully', profile));
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { username, email, bio, company, location, website } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            throw new ApiError(400, 'Email already in use');
        }
    }

    // Update user fields
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (bio !== undefined) updateFields.bio = bio;
    if (company !== undefined) updateFields.company = company;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

// Get user generation history
const getUserHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { type, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let history = [];
    let totalCount = 0;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    if (!type || type === 'all') {
        // Fetch all types
        const [articles, images, titles, bgRemovals] = await Promise.all([
            Article.find({ user: userId })
                .sort(sortOptions)
                .populate('user', 'username')
                .lean(),
            GenImg.find({ user: userId })
                .sort(sortOptions)
                .populate('user', 'username')
                .lean(),
            Blogtitle.find({ user: userId })
                .sort(sortOptions)
                .populate('user', 'username')
                .lean(),
            RemoveBG.find({ user: userId })
                .sort(sortOptions)
                .populate('user', 'username')
                .lean()
        ]);

        // Combine and format all items
        const allItems = [
            ...articles.map(item => ({
                id: item._id,
                type: 'article',
                title: item.title,
                content: item.content,
                prompt: item.prompt,
                createdAt: item.createdAt,
                user: item.user
            })),
            ...images.map(item => ({
                id: item._id,
                type: 'image',
                title: 'Generated Image',
                content: item.genImgUrl,
                prompt: item.userPrompt,
                createdAt: item.createdAt,
                user: item.user
            })),
            ...titles.map(item => ({
                id: item._id,
                type: 'title',
                title: item.title,
                content: item.userContent,
                prompt: item.userContent,
                createdAt: item.createdAt,
                user: item.user
            })),
            ...bgRemovals.map(item => ({
                id: item._id,
                type: 'bg-removal',
                title: 'Background Removed',
                content: item.resImgURL,
                originalImage: item.userImgURL,
                createdAt: item.createdAt,
                user: item.user
            }))
        ];

        // Sort combined results
        allItems.sort((a, b) => {
            if (sortOrder === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        totalCount = allItems.length;
        history = allItems.slice(skip, skip + limitNum);

    } else {
        // Fetch specific type
        let Model, typeMapping;
        
        switch (type) {
            case 'article':
                Model = Article;
                typeMapping = (item) => ({
                    id: item._id,
                    type: 'article',
                    title: item.title,
                    content: item.content,
                    prompt: item.prompt,
                    createdAt: item.createdAt,
                    user: item.user
                });
                break;
            case 'image':
                Model = GenImg;
                typeMapping = (item) => ({
                    id: item._id,
                    type: 'image',
                    title: 'Generated Image',
                    content: item.genImgUrl,
                    prompt: item.userPrompt,
                    createdAt: item.createdAt,
                    user: item.user
                });
                break;
            case 'title':
                Model = Blogtitle;
                typeMapping = (item) => ({
                    id: item._id,
                    type: 'title',
                    title: item.title,
                    content: item.userContent,
                    prompt: item.userContent,
                    createdAt: item.createdAt,
                    user: item.user
                });
                break;
            case 'bg-removal':
                Model = RemoveBG;
                typeMapping = (item) => ({
                    id: item._id,
                    type: 'bg-removal',
                    title: 'Background Removed',
                    content: item.resImgURL,
                    originalImage: item.userImgURL,
                    createdAt: item.createdAt,
                    user: item.user
                });
                break;
            default:
                throw new ApiError(400, 'Invalid history type');
        }

        totalCount = await Model.countDocuments({ user: userId });
        const items = await Model.find({ user: userId })
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate('user', 'username')
            .lean();

        history = items.map(typeMapping);
    }

    const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
    };

    console.log("🔍 Backend - Sending history data:", JSON.stringify({ history: history.length, pagination }, null, 2));
    res.status(200).json(new ApiResponse(200, 'History fetched successfully', { history, pagination }));
});

// Delete history item
const deleteHistoryItem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id, type } = req.params;

    let Model;
    switch (type) {
        case 'article':
            Model = Article;
            break;
        case 'image':
            Model = GenImg;
            break;
        case 'title':
            Model = Blogtitle;
            break;
        case 'bg-removal':
            Model = RemoveBG;
            break;
        default:
            throw new ApiError(400, 'Invalid item type');
    }

    const item = await Model.findOne({ _id: id, user: userId });
    if (!item) {
        throw new ApiError(404, 'Item not found or unauthorized');
    }

    await Model.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, 'Item deleted successfully'));
});

// Get dashboard analytics
const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get daily activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const [articles, images, titles, bgRemovals] = await Promise.all([
            Article.countDocuments({ 
                user: userId, 
                createdAt: { $gte: startOfDay, $lte: endOfDay } 
            }),
            GenImg.countDocuments({ 
                user: userId, 
                createdAt: { $gte: startOfDay, $lte: endOfDay } 
            }),
            Blogtitle.countDocuments({ 
                user: userId, 
                createdAt: { $gte: startOfDay, $lte: endOfDay } 
            }),
            RemoveBG.countDocuments({ 
                user: userId, 
                createdAt: { $gte: startOfDay, $lte: endOfDay } 
            })
        ]);

        dailyActivity.push({
            date: startOfDay.toISOString().split('T')[0],
            articles,
            images,
            titles,
            bgRemovals,
            total: articles + images + titles + bgRemovals
        });
    }

    res.status(200).json(new ApiResponse(200, { dailyActivity }, 'Analytics fetched successfully'));
});

export {
    getUserProfile,
    updateUserProfile,
    getUserHistory,
    deleteHistoryItem,
    getDashboardAnalytics
};