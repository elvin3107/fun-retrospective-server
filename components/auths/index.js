const express = require('express');
const router = express.Router();
const User = require('../users/model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

// Google login
router.post('/google', async (req, res) => {
    try {
        const tokenId = req.body.tokenId;
        const response =  await client.verifyIdToken({
            idToken: tokenId, 
            audience: process.env.GOOGLE_CLIENT
        });

        const { email_verified, email, name } = response.payload;

        if(!email_verified) return res.send({
            result: false,
            message: "Email is not verified"
        });

        const user = await User.findOne({email: email, accessType: "google"});
        if(user) {
            const token = jwt.sign({_id: user._id, name: user.name, type: user.accessType}, process.env.TOKEN_SECRET);
            res.send({
                result: true,
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    type: user.accessType
                }
            });
        } else {
            const salt =  await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(email + process.env.PASSWORD_SECRET, salt);

            const newUser = new User({
                name: name,
                email: email,
                password: hashedPassword,
                accessType: 'google'
            });

            const savedUser = await newUser.save();
            const token = jwt.sign({_id: savedUser._id, name: savedUser.name, type: savedUser.accessType}, process.env.TOKEN_SECRET);
            res.send({
                result: true,
                token: token,
                user: {
                    id: savedUser.id,
                    name: savedUser.name,
                    type: savedUser.accessType
                }
            });
        }
    } catch(err) {
        res.status(400).send(err);
    }
});

router.post('/facebook', async (req, res) => {
    try {
        const { accessToken, userID } = req.body;
        const urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
        const response = await fetch(urlGraphFacebook, { method: 'GET' });
        const jsonResponse = await response.json();

        const { email, name } = jsonResponse;
        const user = await User.findOne({email: email, accessType: "facebook"});
        if(user) {
            const token = jwt.sign({_id: user._id, name: user.name, type: user.accessType}, process.env.TOKEN_SECRET);
            res.send({
                result: true,
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    type: user.accessType
                }
            });
        } else {
            const salt =  await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(email + process.env.PASSWORD_SECRET, salt);

            const newUser = new User({
                name: name,
                email: email,
                password: hashedPassword,
                accessType: 'facebook'
            });

            const savedUser = await newUser.save();
            const token = jwt.sign({_id: savedUser._id, name: savedUser.name, type: savedUser.accessType}, process.env.TOKEN_SECRET);
            res.send({
                result: true,
                token: token,
                user: {
                    id: savedUser.id,
                    name: savedUser.name,
                    type: savedUser.accessType
                }
            });
        }
    } catch(err) {
        res.status(400).send(err);
    }
});

module.exports = router;