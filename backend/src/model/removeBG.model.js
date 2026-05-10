import mongoose from "mongoose";

const RemoveBg_Schema =new mongoose.Schema(
    {
        userImgURL :{
            type : String,
            required : true
        },
        resImgURL :{
          type:String,
          required:true
        },
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            index: true // Add index for better query performance
        }
    },
    {
        timestamps:true
    }
)

// Compound indexes for better query performance
RemoveBg_Schema.index({ user: 1, createdAt: -1 }); // Most common query pattern
RemoveBg_Schema.index({ user: 1, updatedAt: -1 });
RemoveBg_Schema.index({ createdAt: -1 }); // For global queries

// Static method for user stats
RemoveBg_Schema.statics.getUserStats = function(userId, fromDate = null) {
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

const RemoveBG =mongoose.model('RemoveBG',RemoveBg_Schema)
export default RemoveBG;