const mongoose = require('mongoose');
const cClockDB = "cClockDB";

mongoose.connect(`mongodb://localhost/${cClockDB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log(`Connection established to MongoDB ${cClockDB}`);
    })
    .catch((err) => {
        console.log('DB CONNECTION ERROR', err);
    });