import mongoose, { Schema} from "mongoose";

const blogSchema =  new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    authorname: {
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
    }
}, {timestamps: true})

export const Blog = mongoose.model('Blog', blogSchema);