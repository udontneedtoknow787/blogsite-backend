import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { z } from "zod";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";


const saveBlog = async (blogId, userId) => {
    const user = await User.findById({_id: userId})
    user.blogs.push(blogId)
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
    const isValid = blogSchema.safeParse({title, content, authorname: req.user.username})
    if(!isValid.success){
        throw new ApiError(405, "All fields are required.\n*Max 1000 length content is allowed.")
    }
    const blog = await Blog.create({
        title,
        content,
        author: userId,
        authorname: req.user.username
    })
    const createdBlog = await Blog.findById(blog?._id)
    if(!createdBlog){
        throw new ApiError(405, "Unable to create blog!")
    }
    await saveBlog(createdBlog._id, userId)

    // After saving blog, also return updated user blogs list
    const updatedUser = await User.findById(userId)
    // const updatedBlogsList = await User.findById(userId).populate("blogs")
    
    return res
    .status(201)
    .json(new ApiResponse(201, {user: updatedUser, blog: createdBlog}, "Blog created successfully!"))

})

const searchSchema = z.object({
    page: z.number().int().positive(),
    sortType: z.union([z.literal(1), z.literal(-1)]).default(-1),
    limit: z.number().default(process.env.DEFAULT_PAGE_LIMIT ? parseInt(process.env.DEFAULT_LIMIT) : 10)
})

const getBlogs = AsyncHandler(async(req, res) => {
    // console.log("Request body:", req.body)
    let {page, limit, sortType} = req.body
    const isValid = searchSchema.safeParse({page, limit, sortType})
    // console.log("Validation result:", isValid)
    if(!isValid.success){
        page=1; limit=10; sortType=-1
    }
    // console.log("Page:", page, "Limit:", limit, "Sort Type:", sortType)
    const blogs = await Blog
    .find({visible: true})
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
    const blog = await Blog.findById({_id: blogId, visible: true});
    if(!blog){
        throw new ApiError(404, "Blog not found!")
    }
    return res.status(200).json(new ApiResponse(200, blog, "Blog fetched successfully!"))
})

const deleteBlogById = AsyncHandler(async (req, res) => {
    const {blogId} = req.query
    if(!blogId){
        throw new ApiError(400, "No blogId provided!")
    }
    if(!mongoose.Types.ObjectId.isValid(blogId)){
        throw new ApiError(400, "Invalid blogId!")
    }
    const blog = await Blog.findByIdAndUpdate({_id: blogId, visible: true});
    if(!blog){
        throw new ApiError(404, "Blog not found or already deleted!")
    }
    if(blog.authorname.toString() !== req.user.username.toString()){
        logger.warn("Blog author:", blog.authorname, "Delete Request user:", req.user.username)
        throw new ApiError(403, "You are not authorized to delete this blog!")
    }
    blog.visible = false;
    await blog.save({validateBeforeSave: false})
    // Also remove the blog from user's blogs list
    const user = await User.findById(req.user._id);
    user.blogs = user.blogs.filter(b => b.toString() !== blogId.toString());
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {updatedBlogs: user.blogs}, "Blog deleted successfully!"))
})

export {
    postBlog,
    getBlogs,
    getBlogsById,
    deleteBlogById
}