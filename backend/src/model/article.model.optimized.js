import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const articleSchema = new mongoose.Schema(
  {
    prompt: {
        type: String,
        required: true 
    },
    title: { 
        type: String, 
        required: true
    },
    content: {
        type: String, 
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        index: true // Add index for better query performance
    }
    },
    { timestamps: true }
);

// Compound indexes for better query performance
articleSchema.index({ user: 1, createdAt: -1 }); // Most common query pattern
articleSchema.index({ user: 1, updatedAt: -1 });
articleSchema.index({ createdAt: -1 }); // For global queries

// Text index for search functionality (if needed)
articleSchema.index({ title: 'text', content: 'text' });

articleSchema.plugin(mongoosePaginate);

// Add static methods for optimized queries
articleSchema.statics.getUserStats = function(userId, fromDate = null) {
    const matchCondition = { user: userId };
    if (fromDate) {
        matchCondition.createdAt = { $gte: fromDate };
    }
    
    return this.aggregate([
        { $match: matchCondition },
        {
            $group: {
                _id: null,
                count: { $sum: 1 },
                latestDate: { $max: '$createdAt' }
            }
        }
    ]);
};

const Article = mongoose.model('Article', articleSchema);
export default Article;