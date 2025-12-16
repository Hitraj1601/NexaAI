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
            required:true
        }
    },
    {
        timestamps:true
    }
)

const Blogtitle = mongoose.model("Blogtitle", blogtitleSchema)
export default Blogtitle;