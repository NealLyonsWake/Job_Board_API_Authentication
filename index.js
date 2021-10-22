const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/route');
const { Job } = require('./models/job');

mongoose.connect('mongodb://localhost:27017/job_board');

const app = express();
app.use(express.json());
app.use(routes);
app.use(express.urlencoded({ extended: true }));


const port = 3000;
app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});