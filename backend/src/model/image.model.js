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
        },
        genImgUrl: {
            type: String,
            required: true
        }
    }
)

const GenImg = mongoose.model('GenImg',GenImgSchema)
export default GenImg;