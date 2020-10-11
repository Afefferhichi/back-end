const Post = require('../../models/post');

const list = (req, res) => {
    try {
        const condition = req.query;
        Post.find(condition)
            .populate('attachments', 'filename originalname _id')
            .populate({
                path: 'comments',
                model: 'Comment',
                select: 'cmtValue cmtHelpfuls cmtUnHelpfuls postId _id',
                populate: {
                    path: 'attachments',
                    mode: 'Attachment',
                    select: 'filename originalname _id'
                }
            })
            .then(posts => {
                res.json({
                    success: true,
                    posts
                })
            })
            .catch(error => {
                res.json({ error })
            });
    } catch (error) {
        res.status(400).json({ error });
    }

};

const show = (req, res) => {
    try {
        Post.findById(req.params.id)
            .populate('attachments', 'filename originalname _id')
            .populate('comments', 'cmtValue cmtHelpfuls cmtUnHelpfuls postId _id')
            .then(post => {
                res.json({
                    success: true,
                    post
                })
            })
            .catch(error => {
                res.json({ error })
            });
    } catch (error) {
        res.status(400).json({ error });
    }

};


module.exports = {
    list, show
}