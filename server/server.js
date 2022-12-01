
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('./config/mongoose.config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use( express.json(), express.urlencoded({ extended: true }) );
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

require('./routes/cClockDB.routes')(app);

app.listen(PORT, () => {
    console.log(`The server is running on ${PORT}`);
});