import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import User from '../model/user.model.js';
import Article from '../model/article.model.js';
import GenImg from '../model/image.model.js';
import Blogtitle from '../model/blogtitle.model.js';
import RemoveBG from '../model/removeBG.model.js';
import mongoose from 'mongoose';

// Cache for frequently accessed data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get from cache or execute function
const getCachedOrExecute = async (key, fn, duration = CACHE_DURATION) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < duration) {
        return cached.data;
    }
    
    const data = await fn();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
};

// Get user profile with usage statistics (optimized)
const getUserProfile = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userIdStr = req.user.id;

    const user = await User.findById(userIdStr).select('-password').lean();
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Use aggregation pipeline for better performance
    const cacheKey = `profile_${userIdStr}`;
    
    const profileData = await getCachedOrExecute(cacheKey, async () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const statsPipeline = (recentCutoff) => [
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    recent: {
                        $sum: {
                            $cond: [{ $gte: ['$createdAt', recentCutoff] }, 1, 0]
                        }
                    }
                }
            }
        ];

        // Single aggregation per collection, all in parallel
        const [articleStats, imageStats, titleStats, bgStats] = await Promise.all([
            Article.aggregate([{ $match: { user: userId } }, ...statsPipeline(thirtyDaysAgo)]),
            GenImg.aggregate([{ $match: { user: userId } }, ...statsPipeline(thirtyDaysAgo)]),
            Blogtitle.aggregate([{ $match: { user: userId } }, ...statsPipeline(thirtyDaysAgo)]),
            RemoveBG.aggregate([{ $match: { user: userId } }, ...statsPipeline(thirtyDaysAgo)])
        ]);

        const getStatsValue = (stats, field) => (stats[0] ? stats[0][field] : 0);

        const articleCount = getStatsValue(articleStats, 'total');
        const imageCount = getStatsValue(imageStats, 'total');
        const titleCount = getStatsValue(titleStats, 'total');
        const bgRemovalCount = getStatsValue(bgStats, 'total');

        const recentArticles = getStatsValue(articleStats, 'recent');
        const recentImages = getStatsValue(imageStats, 'recent');
        const recentTitles = getStatsValue(titleStats, 'recent');
        const recentBgRemovals = getStatsValue(bgStats, 'recent');

        return {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                company: user.company,
                location: user.location,
                website: user.website,
                joinDate: user.createdAt,
                lastActive: user.updatedAt
            },
            usage: {
                articles: articleCount,
                images: imageCount,
                titles: titleCount,
                backgroundRemovals: bgRemovalCount,
                total: articleCount + imageCount + titleCount + bgRemovalCount
            },
            recentActivity: {
                articles: recentArticles,
                images: recentImages,
                titles: recentTitles,
                backgroundRemovals: recentBgRemovals,
                total: recentArticles + recentImages + recentTitles + recentBgRemovals
            }
        };
    }, 2 * 60 * 1000); // Cache for 2 minutes

    console.log("🔍 Backend - Sending profile data for user:", userIdStr);
    
    // Set cache headers for better client-side caching
    res.set('Cache-Control', 'private, max-age=120'); // 2 minutes browser cache
    res.status(200).json(new ApiResponse(200, 'Profile fetched successfully', profileData));
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
        const existingUser = await User.findOne({ email, _id: { $ne: userId } }).lean();
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
    ).select('-password').lean();

    // Clear cache
    cache.delete(`profile_${userId}`);
    
    res.status(200).json(new ApiResponse(200, 'Profile updated successfully', updatedUser));
});

// Get user generation history (optimized with proper pagination)
const getUserHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    const { type, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50 items per page
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build match pipeline for aggregation
    const matchPipeline = { user: userIdObj };
    const projectPipeline = {
        _id: 1,
        user: 1,
        createdAt: 1,
        updatedAt: 1
    };

    let results = [];
    let totalCount = 0;

    if (!type || type === 'all') {
        // Use faceted search for better performance when fetching all types
        // Fetch all types in parallel using userIdObj for aggregation
        const [articles, images, titles, bgRemovals] = await Promise.all([
            Article.find({ user: userId })
                .select('title content prompt createdAt')
                .sort(sortOptions)
                .lean(),
            GenImg.find({ user: userId })
                .select('genImgUrl userPrompt createdAt')
                .sort(sortOptions)
                .lean(),
            Blogtitle.find({ user: userId })
                .select('title userContent createdAt')
                .sort(sortOptions)
                .lean(),
            RemoveBG.find({ user: userId })
                .select('resImgURL userImgURL createdAt')
                .sort(sortOptions)
                .lean()
        ]);

        const allItems = [];
        articles.forEach(item => {
            allItems.push({
                id: item._id,
                type: 'article',
                title: item.title,
                content: item.content,
                prompt: item.prompt,
                createdAt: item.createdAt,
                user: { username: req.user.username }
            });
        });

        images.forEach(item => {
            allItems.push({
                id: item._id,
                type: 'image',
                title: 'Generated Image',
                content: item.genImgUrl,
                prompt: item.userPrompt,
                createdAt: item.createdAt,
                user: { username: req.user.username }
            });
        });

        titles.forEach(item => {
            allItems.push({
                id: item._id,
                type: 'title',
                title: item.title,
                content: item.userContent,
                prompt: item.userContent,
                createdAt: item.createdAt,
                user: { username: req.user.username }
            });
        });

        bgRemovals.forEach(item => {
            allItems.push({
                id: item._id,
                type: 'bg-removal',
                title: 'Background Removed',
                content: item.resImgURL,
                originalImage: item.userImgURL,
                createdAt: item.createdAt,
                user: { username: req.user.username }
            });
        });

        // Sort combined results
        allItems.sort((a, b) => {
            if (sortOrder === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        totalCount = allItems.length;
        results = allItems.slice(skip, skip + limitNum);

    } else {
        // Single collection query for specific type
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
                    user: { username: req.user.username }
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
                    user: { username: req.user.username }
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
                    user: { username: req.user.username }
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
                    user: { username: req.user.username }
                });
                break;
            default:
                throw new ApiError(400, 'Invalid history type');
        }

        // Get count and items in parallel
        const [count, items] = await Promise.all([
            Model.countDocuments({ user: userId }),
            Model.find({ user: userId })
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .lean()
        ]);

        totalCount = count;
        results = items.map(typeMapping);
    }

    const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1
    };

    // Set cache headers
    res.set('Cache-Control', 'private, max-age=180'); // 3 minutes browser cache
    
    console.log("🔍 Backend - Sending history data:", JSON.stringify({ history: results.length, pagination }, null, 2));
    res.status(200).json(new ApiResponse(200, 'History fetched successfully', { history: results, pagination }));
});

// Delete history item (optimized)
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

    const result = await Model.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
        throw new ApiError(404, 'Item not found or unauthorized');
    }

    // Clear related caches
    cache.delete(`profile_${userId}`);
    cache.delete(`analytics_${userId}`);

    res.status(200).json(new ApiResponse(200, null, 'Item deleted successfully'));
});

// Get dashboard analytics (optimized — 4 parallel aggregations instead of 28 sequential queries)
const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    const cacheKey = `analytics_${userId}`;
    
    const analyticsData = await getCachedOrExecute(cacheKey, async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Single aggregation pipeline per collection — groups by UTC date string
        const dailyPipeline = [
            { $match: { user: userIdObj, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ];

        // Run all 4 aggregations in parallel — just 4 round-trips total
        const [articleDays, imageDays, titleDays, bgDays] = await Promise.all([
            Article.aggregate(dailyPipeline),
            GenImg.aggregate(dailyPipeline),
            Blogtitle.aggregate(dailyPipeline),
            RemoveBG.aggregate(dailyPipeline)
        ]);

        // Build lookup maps for O(1) access
        const toMap = (arr) => Object.fromEntries(arr.map(d => [d._id, d.count]));
        const articleMap = toMap(articleDays);
        const imageMap   = toMap(imageDays);
        const titleMap   = toMap(titleDays);
        const bgMap      = toMap(bgDays);

        // Build the 7-day activity array in JS — no more DB loops
        const dailyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const a = articleMap[dateStr] || 0;
            const im = imageMap[dateStr] || 0;
            const t = titleMap[dateStr] || 0;
            const b = bgMap[dateStr] || 0;

            dailyActivity.push({
                date: dateStr,
                articles: a,
                images: im,
                titles: t,
                bgRemovals: b,
                total: a + im + t + b
            });
        }

        return { dailyActivity };
    }, 10 * 60 * 1000); // Cache for 10 minutes

    // Set cache headers
    res.set('Cache-Control', 'private, max-age=600'); // 10 minutes browser cache
    
    res.status(200).json(new ApiResponse(200, 'Analytics fetched successfully', analyticsData));
});

// Clear cache endpoint for development/debugging
const clearCache = asyncHandler(async (req, res) => {
    cache.clear();
    res.status(200).json(new ApiResponse(200, { cleared: true }, 'Cache cleared successfully'));
});

export {
    getUserProfile,
    updateUserProfile,
    getUserHistory,
    deleteHistoryItem,
    getDashboardAnalytics,
    clearCache
};