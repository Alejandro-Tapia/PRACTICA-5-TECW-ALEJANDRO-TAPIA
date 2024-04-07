const createError = require('http-errors');
const Sequelize = require("sequelize");
const { Post, Attachment } = require('../models');

// Autoload del post asociado a :postId
exports.load = async (req, res, next, postId) => {

    try {
        const post = await Post.findByPk(postId, {
            include: [
                {model: Attachment, as: 'attachment'}
            ]
        });
        if (post) {
            req.load = {...req.load, post};
            next();
        } else {
            throw createError(404, 'There is no post with id=' + postId);
        }
    } catch (error) {
        next(error);
    }
};
// GET /posts
exports.index = async (req, res, next) => {

    try {
        const findOptions = {
            include: [
                {model: Attachment, as: 'attachment'}
            ]
        };
        const posts = await Post.findAll(findOptions);
        res.render('posts/index.ejs', {posts});
    } catch (error) {
        next(error);
    }
};
// GET /posts/:postId
exports.show = (req, res, next) => {

    const {post} = req.load;

    const {attachment} = post;

    res.render('posts/show', {post, attachment});

};

// GET /posts/:postId/attachment
exports.attachment = (req, res, next) => {

    const {post} = req.load;

    const {attachment} = post;

    if (!attachment) {
        res.redirect("/images/none.png");
    } else if (attachment.image) {
        res.type(attachment.mime);
        res.send(attachment.image);
    } else if (attachment.url) {
        res.redirect(attachment.url);
    } else {
        res.redirect("/images/none.png");
    }
}

// GET /posts/new
exports.new = (req, res, next) => {

    const post = {
        title: "",
        body: ""
    };

    res.render('posts/new', {post});
};


// POST /posts/create
exports.create = async (req, res, next) => {

    const {title, body} = req.body;

    let post;
    try {
        post = Post.build({
            title,
            body
        });

        post = await post.save({fields: ["title", "body"]});

        try {

            const attachment = await Attachment.create({
                mime: req.file.mimetype,
                image: req.file.buffer,
                url: null
            });
            await post.setAttachment(attachment);
        } catch (error) {
            console.log('Error:' + error.message);
        } 
    } catch (error) {
        if (error instanceof (Sequelize.ValidationError)) {
            console.log('Error');
            error.errors.forEach(({message}) => console.log(message));
            res.render('posts/new', {post});
        } else {
            next(error);
        }
    }  finally {
        res.redirect('/posts/' + post.id);
    }

};

// GET /posts/:postId/edit
exports.edit = (req, res, next) => {

    const {post} = req.load;

    res.render('posts/edit', {post});
};

// PUT /posts/:postId
exports.update = async (req, res, next) => {

    const {post} = req.load;

    console.log('Updating post = ', post.id)

    post.title = req.body.title;
    post.body = req.body.body;

    try {
        await post.save({fields: ["title", "body"]});
        

        try {

            await post.attachment?.destroy();

            const attachment = await Attachment.create({
                mime: req.file.mimetype,
                image: req.file.buffer,
                url: null
            });
            await post.setAttachment(attachment);
            
        } catch (error) {
            console.log('Error:' + error.message);
        } finally {
            res.redirect('/posts/' + post.id);
        }
    } catch(error){
        console.log('Error:' + error.message);
        next(error);
    } 
}

// DELETE /posts/:postId
exports.destroy = async (req, res, next) => {

    const attachment = req.load.post.attachment;

    try {
        await req.load.post.destroy();
        await attachment?.destroy();
        res.redirect('/posts');
    } catch (error) {
        console.log('Error:' + error.message);

        next(error);
    }
};