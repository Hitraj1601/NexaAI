import mongoose from 'mongoose'

const blogtitleSchema = new mongoose.Schema(
    {
        userContent:{
            type : String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
            required:true,
            index: true // Add index for better query performance
        }
    },
    {
        timestamps:true
    }
)

// Compound indexes for better query performance
blogtitleSchema.index({ user: 1, createdAt: -1 }); // Most common query pattern
blogtitleSchema.index({ user: 1, updatedAt: -1 });
blogtitleSchema.index({ createdAt: -1 }); // For global queries

// Text index for content and title search
blogtitleSchema.index({ title: 'text', userContent: 'text' });

// Static method for user stats
blogtitleSchema.statics.getUserStats = function(userId, fromDate = null) {
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

const Blogtitle = mongoose.model("Blogtitle", blogtitleSchema)
export default Blogtitle;