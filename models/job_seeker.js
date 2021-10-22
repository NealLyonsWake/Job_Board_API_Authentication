const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const JobSeekerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
            },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    }
});

JobSeekerSchema.plugin(passportLocalMongoose);

const JobSeeker = mongoose.model('JobSeeker', JobSeekerSchema);

module.exports = { JobSeeker }


