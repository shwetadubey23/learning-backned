const BlogModel = require("../models/blogModel");
const AuthorModel = require('../models/authorModel');
const ObjectId = require('mongoose').Types.ObjectId

//**     /////////////////////////      Createblog      //////////////////////       **//
const createBlog = async (req, res) => {
    try {

        const newBlog = req.body;
        let { title, body, authorId, category, isPublished } = newBlog

        if (Object.keys(newBlog) == 0) return res.status(400).send({ status: false, msg: "please provide details" })

        if (!ObjectId.isValid(authorId)) return res.status(400).send({ status: false, msg: "Invalid authorId" })

        if (!title) return res.status(400).send({ status: false, msg: "Title is required" });
        if (!body) return res.status(400).send({ status: false, msg: "Body is required" });
        if (!authorId) return res.status(400).send({ status: false, msg: "AuthorId is required" });
        if (!category) return res.status(400).send({ status: false, msg: "Category is required" });

        const validateAuthorId = await AuthorModel.findById(authorId);
        if (!validateAuthorId) return res.status(404).send({ status: false, msg: "author deoesn't exist" });
     
        const data = await BlogModel.create(newBlog);

        if (isPublished === true) {
            data.publishedAt = new Date();
            data.save();
        }

        res.status(201).send({ status: true, data: data });
    } catch (err) {
        res.status(500).send({ msg: err.message });
    }
}


//////////////////////////////////////////// getBlogs /////////////////////////////////////////////
const getBlogs = async (req, res) => {
    try {
        let queries = req.query;

        let allBlogs = await BlogModel.find({
            $and: [queries, { isDeleted: false, isPublished: true }]
        });
        if (allBlogs.length == 0) return res.status(404).send({ status: false, msg: "No blog found" });
        res.status(200).send({ status: true, data: allBlogs });
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}


///////////////////////////////////////////// updateBlog ///////////////////////////////////////////

const updateBlog = async (req, res) => {
    try {

        let blogId = req.params.blogId

        let details = req.body;

        const updatedBlog = await BlogModel.findOneAndUpdate(
            { _id: blogId },
            {
                $push: { tags: details.tags, subcategory: details.subcategory },
                $set: { title: details.title, body: details.body, category: details.category, isPublished: true, publishedAt: Date.now() },
            }, { new: true }
        );
        res.status(200).send({ status: true, data: updatedBlog });
    } catch (err) {
        res.status(500).send({ msg: err.message });
    }
}


//////////////////////////////////////      deleteById      ///////////////////////////////////
const deleteBlogById = async (req, res) => {
    try {
        let blogId = req.params.blogId;

        let deleteBlog = await BlogModel.updateOne(
            { _id: blogId },
            { isDeleted: true, deletedAt: Date.now() },
            { new: true }
        );
        res.status(200).send({ status: true, msg: "document deleted successfully" });
    } catch (err) {
        res.status(500).send({ msg: err.message });
    }
}


////////////////////////////////////////      deleteByQuery     //////////////////////////////////////
const deleteBlogByQueryParam = async (req, res) => {
    try {

        let queries = req.query;
        // if (!queries) return res.status(404).send({ status: false, msg: "please add queries" });

        let filterByQuery = await BlogModel.findOne(queries);
        if (!filterByQuery) return res.status(404).send({ status: false, msg: "blog doesn't exist" });

        if (filterByQuery.isDeleted == true) return res.status(404).send({ status: false, msg: "blog already deleted" });
        
        let userId = req.validateToken.userId
        // console.log(userId)

        if (userId !== filterByQuery.authorId.toString()) return res.status(404).send({ status: false, msg: "not authorised" })

        let deletedBlogDetails = await BlogModel.updateMany(
            { $and: [queries, { isDeleted: false }] },
            { $set: { isDeleted: true, deletedAt: Date.now() } },
            { new: true }
        );
        res.status(200).send({ status: true, msg: "document deleted successfully" });

        // if (!deletedBlogDetails) 
    } catch (err) {
        res.status(500).send({ status: "error", error: err.message });
    }
}



module.exports = { createBlog, getBlogs, updateBlog, deleteBlogById, deleteBlogByQueryParam };