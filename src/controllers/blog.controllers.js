import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { z } from "zod";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";


const saveBlog = async (blogId, userId) => {
    const user = await User.findById(userId)
    await user.blogs.push(blogId)
    try {
        await user.save({validateBeforeSave: false})
    } catch (error) {
        throw new ApiError(500, "Failed to save blog in user model.")
    }
}

const blogSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(4).max(1000),
    authorname: z.string().min(2).max(50)
})

const postBlog = AsyncHandler(async(req, res) => {
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(403, "No registred user")
    }
    const {title, content } = req.body
    const isValid = blogSchema.safeParse({title, content, authorname: req.user.fullname})
    if(!isValid.success){
        throw new ApiError(405, "All fields are required.\n*Max 1000 length content is allowed.")
    }
    const blog = await Blog.create({
        title,
        content,
        author: userId,
        authorname: req.user.fullname
    })
    const createdBlog = await Blog.findById(blog?._id)
    if(!createdBlog){
        throw new ApiError(405, "Unable to create blog!")
    }
    await saveBlog(createdBlog._id, userId)
    
    return res
    .status(201)
    .json(new ApiResponse(201, createdBlog, "Blog created successfully!"))

})

const searchSchema = z.object({
    page: z.number().int().positive(),
    sortType: z.enum(["-1", "1"]),
    limit: z.number().default(process.env.DEFAULT_LIMIT)
})

const getBlogs = AsyncHandler(async(req, res) => {
    let {page=1, limit=10, sortType=-1} = req.body
    const isValid = searchSchema.safeParse({page, limit, sortType})
    if(!isValid.success){
        page=1; limit=10; sortType=-1
    }

    const blogs = await Blog
    .find()
    .sort({"createdAt": sortType} || "-createdAt")
    .skip((page-1)*limit)
    .limit(limit)

    if(blogs.length === 0){
        throw new ApiError(405, "Unable to find blogs!")
    }

    return res.status(200).json(new ApiResponse(200, blogs, "Bloggs fethced successfully!"))
})


const getBlogsById = AsyncHandler(async (req, res) => {
    const {blogId} = req.query
    if(!blogId){
        throw new ApiError(400, "No blogId provided!")
    }
    if(!mongoose.Types.ObjectId.isValid(blogId)){
        throw new ApiError(400, "Invalid blogId!")
    }
    const blog = await Blog.findById(blogId)
    if(!blog){
        throw new ApiError(404, "Blog not found!")
    }
    return res.status(200).json(new ApiResponse(200, blog, "Blog fetched successfully!"))
})

export {
    postBlog,
    getBlogs,
    getBlogsById
}