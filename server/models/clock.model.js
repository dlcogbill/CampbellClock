const mongoose = require('mongoose');

const ClockSchema = new mongoose.Schema(
    {
        in: {
            type: Date,
        },
        out: {
            type: Date,
        },
        shift:{
            type: Number,
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true
    }
);

const Clock = mongoose.model('Clock', ClockSchema);

module.exports = Clock;