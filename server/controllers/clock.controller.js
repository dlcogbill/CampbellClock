const Clock = require('../models/clock.model');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const SECRET = process.env.SECRET_KEY;

const punchIn = async (req,res) => {
    try {
        //Get logged in employee
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET)
        console.log('USER', userPayLoad);
        //if user is logged in and not already clocked in
        //create Clock with id from token, then clock in user in db
        if ( userPayLoad && !userPayLoad.clockedin ) {
            Clock.create({ in : Date.now() , employee : userPayLoad._id })
                .then((newPunch) => {
                    console.log('SUCCESSFULLY CREATED PUNCH:', newPunch);
                    //clock in user in db
                    User.findByIdAndUpdate(
                            userPayLoad._id,
                            //user in db clockedin = true, 
                            { clockedin : true, lastClock : newPunch._id },
                            { new: true, runValidators: true })
                        .then((user) => {
                            delete user.password;
                            console.log('SUCCESSFULLY CLOCKED IN:', user);
                            res.status(201).json({
                                message: 'PUNCH CREATED',
                                punch : newPunch,
                                });
                        })
                })
        } else {
            res.status(400).json({ message: 'Something went wrong with user'});
        }
    } catch(err) {
        res.status(400).json({ message: 'Something went wrong with punch in', error: err });
    }
}

const punchOut = async (req,res) => {
    try {
        //update token
        //Get logged in employee
        const userPayLoad = jwt.verify(req.cookies.userToken,SECRET)
        console.log('PUNCH OUT');
        console.log('USER', userPayLoad);
        //if user is logged in and already clocked in
        //then find Clock from logged in user, record out and find shift, then clock out user
        if ( userPayLoad && userPayLoad.clockedin ) {
            Clock.findByIdAndUpdate(
                    userPayLoad.lastClock,
                    {
                        out : Date.now(),
                        shift : diff_hours(this.in, Date.now()),
                    },
                    { new: true, runValidators: true })
                .then((editPunch) => {
                    console.log('SUCCESSFULLY RECORDED OUT:', editPunch);
                    User.findByIdAndUpdate(
                            userPayLoad._id,
                            //clockedin = false, lastclock=null, increment total hours by shift
                            {
                                clockedin : false,
                                lastClock : null,
                                profile : { totalhours : this.profile.totalhours + editPunch.shift },
                            },
                            { new: true, runValidators: true })
                        .then((user) => {
                            delete user.password;
                            console.log('SUCCESSFULLY CLOCKED OUT:', user);
                            res.status(201).json({
                                message: 'PUNCHED OUT',
                                punch : editPunch,
                                user : user,
                            });
                        })
                })
        } else  {
            res.status(400).json({ message: 'Something went wrong with user'});
        }
    } catch(err) {
        res.status(400).json({ message: 'Something went wrong with punch out', error: err });
    }
}

const employeePunches = async (req,res) => {
    //get logged in employee
    const userPayLoad = jwt.verify(req.cookies.userToken,SECRET);
    console.log('USER', userPayLoad);
    //find all clock instances with user id
    Clock.find({ employee: userPayLoad._id })
        .populate('employee', 'userPayLoad.username')
        //sort from oldest to newest
        .sort({ createdAt: 'asc' })
        .exec((userClocks) => {
            res.json(userClocks);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json({ message: 'Something went wrong in employeePunches', error: err });
        });
}

function diff_hours(dt2, dt1) {
    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= (60 * 60);
    return Math.abs(Math.round(diff));
}

module.exports = {
    //Controls for Clock
    punchIn,
    punchOut,
    employeePunches,
};