import mongoose from 'mongoose'

const GenImgSchema = new mongoose.Schema(
    {
        userPrompt: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true // Add index for better query performance
        },
        genImgUrl: {
            type: String,
            required: true
        }
    },
    {
        timestamps:true
    }
)

// Compound indexes for better query performance
GenImgSchema.index({ user: 1, createdAt: -1 }); // Most common query pattern
GenImgSchema.index({ user: 1, updatedAt: -1 });
GenImgSchema.index({ createdAt: -1 }); // For global queries

// Text index for prompt search
GenImgSchema.index({ userPrompt: 'text' });

// Static method for user stats
GenImgSchema.statics.getUserStats = function(userId, fromDate = null) {
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

const GenImg = mongoose.model('GenImg',GenImgSchema)
export default GenImg;