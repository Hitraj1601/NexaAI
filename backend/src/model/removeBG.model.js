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
            ref:'User'
        }
    },
    {
        timestamps:true
    }
)

const RemoveBG =mongoose.model('RemoveBG',RemoveBg_Schema)
export default RemoveBG;