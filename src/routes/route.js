// importing express // creating router
const express = require('express');
const router = express.Router();

// importing controllers
const Middlewares = require('../middlewares/commonMiddleware')
const AuthorController = require("../controllers/authorController");
const BlogController = require("../controllers/blogController");


//**    APIS   **//

// Author apis
router.post("/login", AuthorController.login);
router.post("/authors", AuthorController.createAuthor);

// blogs apis
router.post("/blogs", Middlewares.authentication, BlogController.createBlog);

router.get("/blogs", Middlewares.authentication, BlogController.getBlogs);

router.put('/blogs/:blogId', Middlewares.authentication, Middlewares.authorization, BlogController.updateBlog);

router.delete('/blogs/:blogId', Middlewares.authentication, Middlewares.authorization, BlogController.deleteBlogById);

router.delete('/blogs', Middlewares.authentication, BlogController.deleteBlogByQueryParam);



module.exports = router;

