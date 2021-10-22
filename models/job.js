const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
});

const Job = mongoose.model('Job', JobSchema);

module.exports = { Job }