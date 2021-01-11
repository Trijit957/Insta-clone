const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt_secret } = require('../keys');
const requireSignin = require('../middleware/requireSignin');

const User = require('../model/userSchema');


router.post('/signup', (req, res) => {
    const {name,email,password} = req.body;
    if(!name || !email || !password)
    {
        return res.status(422).json({error: "Please add all the fields!"});
    }
    
        // res.status(200).json({message: "Successfully posted!"});
        User.findOne({email: email}).then((savedUser) => {
            if(savedUser) {
                res.status(422).json({error: "User already exists!"}); 
            }
        
        bcrypt.hash(password,12)
        .then((hashedPassword) => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPassword
            });
    
            user.save()
            .then((user) => {
                res.json({message: "Your Account has been created!"});
            })
            .catch((err) => {
                console.log("Internal server ERROR!", err);
            });
        });
        
    })
    .catch((err) => {
        console.log("Internal server ERROR!", err);
    });
});


router.post('/signin', (req, res) => {
   const {email,password} = req.body;
   if(!email || !password) {
       return res.status(422).json({error: "Please add email or password!"});
   }

   User.findOne({email: email})
   .then((savedUser) => {
       if(!savedUser) {
           return res.status(422).json({erroor: "Invalid Email or Password!"});
       }
       bcrypt.compare(password,savedUser.password)
       .then((doMatch) => {
           if(doMatch) {
            //    res.json({message: "Successfully signed in!"});
              const token = jwt.sign({_id: savedUser._id}, jwt_secret);
              const {_id,name,email} = savedUser;
              res.json({token, user: {_id,name,email}});
           }
           else{
            return res.status(422).json({error: "Invalid Email or Password!"}); 
           }
       }).catch((err) => {
        console.log("Internal server ERROR!", err);
    });

   }).catch((err) => {
        console.log("Internal server ERROR!", err);
    });
});


module.exports = router;