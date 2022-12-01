const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();
const SECRET = process.env.SECRET_KEY;

//Employee registration
const register = async (req,res) => {
    try {
        const user = new User(req.body);
        const newUser = await user.save();
        console.log('NEW USER', newUser);
        const userToken = jwt.sign({
            _id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            usertype: newUser.usertype,
            clockedin: false,
            lastClock: null,
        }, SECRET );
        res
            .status(201)
            .cookie('userToken', userToken, {
                expires: new Date(Date.now() + 1000000),
            })
            .json({
                message: 'USER CREATED',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    usertype: user.usertype,
                },
            })
    } catch(err) {
        res
            .status(400)
            .json({
                message: 'Something went wrong in register',
                error: err
            });
    }
};

//Employee Login
const login = async (req, res) => {
    const userDoc = await User.findOne({ username: req.body.username});
    if (!userDoc) {
        res.status(400).json({ message: 'Invalid Login'});
    } else {
        try {
            const isPasswordValid = bcrypt.compare(req.body.password,userDoc.password);
            if (!isPasswordValid) {
                res.status(400).json({ message: 'Invalid Login'});
            } else {
                const userToken = jwt.sign({
                    _id: userDoc._id,
                    email: userDoc.email,
                    username: userDoc.username,
                    usertype: userDoc.usertype,
                    clockedin: userDoc.clockedin,
                    lastClock: userDoc.lastClock,
                }, SECRET );
                res
                    .cookie('userToken', userToken, {
                        expires: new Date(Date.now() + 1000000),
                    })
                    .json({
                        message: 'USER LOGGED IN',
                        user: {
                            _id: userDoc._id,
                            email: userDoc.email,
                            username: userDoc.username,
                            usertype: userDoc.usertype,
                            clockedin: userDoc.clockedin,
                            lastClock: userDoc.lastClock,
                        },
                    });
            }
        } catch(err) {
            res.status(400).json({ message: 'Invalid Login'});
        }
    }
};

//Employee logout
const logout = (req, res) => {
    res.clearCookie('userToken');
    res.json({ message: 'SUCCESSFULLY LOGGED OUT' });
};

//Logged in user
const getLoggedInUser = async (req, res) => {
    try {
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET)
        console.log('USER', userPayLoad);
        const user = await User.findOne({ _id: userPayLoad._id });
        console.log('SUCCESSFULLY RETREIVED LOGGED IN USER:');
        res.json({
            message: 'LOGGED IN USER',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                usertype: user.usertype,
                clockedin: user.clockedin,
                lastClock: user.lastClock,
                profile: user.profile,
            }
        })
    } catch(err) {
        res.status(400).json({ message: 'Invalid Login'})
    }
};

//Get all users
const getUsers = async (req, res) => {
    try {
        //Get logged in user info
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET);
        const user = await User.findOne({ _id: userPayLoad._id });
        //If logged in user has valid credentials, return all user info w/o password
        if ( user.usertype == 'Manager' || user.usertype == 'Admin') {
            User.find()
                .then((allUsers) => {
                    for (var i=0; i < allUsers.length; i++) {
                        delete allUsers[i].password;
                    }
                    console.log('USERS:', allUsers);
                    res.json(allUsers);
                })
        } else {
            res.status(400).json({ message: 'Invalid Credentials'})
        }
    } catch(err) {
        res.status(400).json({ message: 'Something went wrong in user:findAll', error: err });
    };
}

//Delete User
const deleteUser = async (req, res) => {
    try {
        //Get logged in user info
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET);
        const user = await User.findOne({ _id: userPayLoad._id });
        //If logged in user has valid credentials, delete user
        if ( user.usertype == 'Manager' || user.usertype == 'Admin') {
            User.deleteOne({ _id: req.params.id })
                .then((user) => {
                    console.log('SUCCESSFULLY DELETED:', user);
                    res.json(user);
                })
        } else {
            res.status(400).json({ message: 'Invalid Credentials'})
        }
    } catch(err) {
        res.status(400).json({ message: 'Something went wrong in delete', error: err })
    }
}

//Update an Employee
const update = async (req, res) => {
    try {
        //Get logged in user info
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET);
        const user = await User.findOne({ _id: userPayLoad._id });
        //user is verified if user is mnager or admin or user id matches id on request
        const isVerified = user.usertype == 'Manager' || user.usertype == 'Admin' || user._id == req.body._id;
        //If logged in user has valid credentials, update user profile only
        if ( isVerified ) {
            User.findByIdAndUpdate(req.params.id, { profile : req.body.profile }, { new: true, runValidators: true })
                .then((editUser) => {
                    delete editUser.password;
                    console.log('SUCCESSFULLY UPDATED:', editUser);
                    res.json(editUser);
                })
        }else {
            res.status(400).json({ message: 'Invalid Credentials'})
        }
    } catch(err) {
        res.status(400).json({ message: 'Something went wrong in update', error: err })
    }
}

//Verify an Employee
const verify = async (req, res) => {
    try {
        //Get logged in user info
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET);
        const user = await User.findOne({ _id: userPayLoad._id });
        //user is verified if request by manager or admin
        const isVerified = user.profile.usertype == 'Manager' || user.profile.usertype == 'Admin';
        //If logged in user has valid credentials, verify user in request
        if ( isVerified ) {
            User.findByIdAndUpdate(req.params.id, { verified : true }, { new: true, runValidators: true })
                .then((verifiedUser) => {
                    delete verifiedUser.password;
                    console.log('SUCCESSFULLY VERIFIED:', verifiedUser);
                    res.json(verifiedUser);
                })
        } else {
            res.status(400).json({ message: 'Invalid Credentials'})
        }
    } catch(err) {
        res.status(400).json({ message: 'Something went wrong in verify', error: err })
    }
}

module.exports = { //Controls for User
    register,
    login,
    logout,
    getLoggedInUser,
    getUsers,
    deleteUser,
    update,
    verify,
};