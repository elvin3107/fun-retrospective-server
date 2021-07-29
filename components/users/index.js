const express = require('express');
const router = express.Router();
const User = require('./model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation, changePasswordValidation, AuthenticateToken } = require('./service');

// Get all user from data base
router.get('/', async (req, res) => {
    try {
        const allUser = await User.find();
        res.json(allUser);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Get one user
router.get('/:userId', AuthenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.json(user);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Create
router.post('/register', async (req, res) => {
    const {error} = registerValidation(req.body);
    if(error) return res.send({
        result: false,
        message: error.details[0].message
    });

    const checkExist = await User.findOne({email: req.body.email});
    if(checkExist) return res.send({
        result: false,
        message: "Email already exist"
    });

    const salt =  await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        accessType: 'email'
    });

    try {
        const savedUser = await user.save();
        res.send({
            result: true
        });
    } catch(err) {
        res.send({
            result: false,
            message: "Failed to register: " + err
        });
    }
});

// User login
router.post('/login', async (req, res) => {
    const {error} = loginValidation(req.body);
    if(error) return res.send({
        result: false,
        message: error.details[0].message
    });

    const user = await User.findOne({email: req.body.email, accessType: "email"});
    if(!user) return res.send({
        result: false,
        message: "Email or password is wrong"
    });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.send({
        result: false,
        message: "Invalid password"
    });

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
});

// Check login
router.post('/checkLogin', AuthenticateToken, (req, res) => {
    if(req.user) {
        res.send({
            user: {
                id: req.user._id,
                name: req.user.name,
                type: req.user.accessType
            }
        });
    }
});

// Change password
router.post('/changePassword', AuthenticateToken, async (req, res) => {
    const {error} = changePasswordValidation(req.body);
    if(error) return res.send({
        result: false,
        message: error.details[0].message
    });

    const user = await User.findOne({email: req.body.email});
    if(!user) return res.send({
        result: false,
        message: "Email is wrong"
    });

    const validPass = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!validPass) return res.send({
        result: false,
        message: "Old password is wrong"
    });

    const salt =  await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    try {
        const updatedUser = await User.findByIdAndUpdate(user._id, {
            password: hashedPassword
        }, { new: true });
        res.send({
            result: true,
        });
    } catch(err) {
        res.status(400).send(err);
    }
});

// Update user
router.patch('/:userId', AuthenticateToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId, req.body, { new: true }
        );
        res.send({
            result: true,
        });
    } catch(err) {
        res.status(400).send(err);
    }
});

// Delete user
router.delete('/:userId', AuthenticateToken, async (req, res) => {
    try {
        const user = await User.deleteOne({_id: req.params.userId});
        res.json(user);
    } catch(err) {
        res.status(400).send(err);
    }
})

module.exports = router;