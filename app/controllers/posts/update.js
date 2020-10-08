const Post = require('../../models/post');

const update = (req, res) => {
    const {
        pstOrder,
        pstTitle,
        pstContent,
        attachmentIds,
        pstRate,
        createdBy,
        updatedBy
    } = req.body;
    if (
        !pstTitle ||
        !pstContent
    ) {
        res.json({
            error: 'All fields are mandatory !'
        })
    } else {
        try {
            Post.findByIdAndUpdate(req.params.id, {
                pstOrder,
                pstTitle,
                pstContent,
                attachmentIds,
                pstRate,
                updatedAt: new Date(),
                createdBy,
                updatedBy
            })
                .then((post) => res.json({success: post !== null}))
                .catch(error => res.status(400).json({success: false, error}));
        } catch (error) {
            res.status(400).json({success: false, error});
        }
    }

};

module.exports = update;