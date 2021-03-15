const express = require('express');
const router = express.Router();

const Post = require('../model/postSchema');
const requireSignin = require('../middleware/requireSignin');

router.post('/createpost',requireSignin, (req, res) => {
    const {title,body,image_url} =  req.body;
    
    if(!title || !body || !image_url) {
        res.status(422).json({error: "Please add all fields!"});
    }
    const post = new Post({
        title: title,
        body: body,
        image_url: image_url,
        postedBy: req.user
    });

    post.save().then(result => {
        res.json({post: result});
    })
    .catch(err => {
        console.log("Internal server ERROR!", err);
    });
});

router.get('/allpost',requireSignin, (req, res) => {
     Post.find().sort({ _id : -1 }).populate("postedBy","_id name email").populate("comments.postedBy","_id name").then(posts => {
         res.json(posts);
     }).catch(err => {
         console.log("Internal server ERROR!", err);
     })
});

router.get('/mypost',requireSignin, (req, res) => {
    Post.find({postedBy: req.user._id}).sort({ _id : -1 }).populate("postedBy","_id name").then(myposts => {
        res.json(myposts);
    }).catch(err => {
        console.log("Internal server ERROR!", err);
    })
});

router.put('/like',requireSignin, (req, res) => {
     Post.findByIdAndUpdate(req.body.postID, {
         $push: {likes: req.user._id}
     },{ new: true }).populate("postedBy","_id name").exec((err, result) => {
         if(err) {
             return res.status(422).json({error: err});
         }
         else {
             res.json(result);
         }
     })
});

router.put('/unlike',requireSignin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postID, {
        $pull: {likes: req.user._id}
    },{ new: true }).populate("postedBy","_id name").exec((err, result) => {
        if(err) {
            return res.status(422).json({error: err});
        }
        else {
            res.json(result);
        }
    })
});

router.put('/comment',requireSignin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postID, {
        $push: {comments: comment}
    },{ new: true }).populate("comments.postedBy","_id name").populate("postedBy","_id name").exec((err, result) => {
        if(err) {
            return res.status(422).json({error: err});
        }
        else {
            res.json(result);
        }
    })
});

router.delete('/deletepost/:postId', (req, res) => {
    Post.findOne({_id: req.params.postId}).populate("postedBy", "_id").exec((err, post) => {
        if(err || !post) {
            return res.status(422).json({error: err});
        }
        if(post.postedBy._id.toString() === req.user._id.toString()) {
            post.remove()
                .then((result) => {
                    res.json(result);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    })
})

module.exports = router;