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
    }
    },
    { timestamps: true }
);

articleSchema.plugin(mongoosePaginate);
const Article = mongoose.model('Article', articleSchema);
export default Article;
