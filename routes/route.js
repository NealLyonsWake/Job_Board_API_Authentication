const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');

const { Job } = require('../models/job');
const { JobSeeker } = require('../models/job_seeker')
const { jobsArray } = require('../jobList');

const router = express.Router();

let ExtractJWT = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};

jwtOptions.jwtFromRequest = ExtractJWT.fromAuthHeaderWithScheme("jwt");
jwtOptions.secretOrKey = "secretSquirrel";

// I struggled to understand the fundamentals of the below strategy.
// The below code is copied from class and variables changed.
// Unable to grasp concept in 48 hours.
let strategy = new JwtStrategy(
    jwtOptions,
    function (jwt_payload, next) {
        JobSeeker.findOne({ id: jwt_payload.id }, function (err, jobSeeker) {
            if (jobSeeker) {
                next(null, jobSeeker);
            }
            else {
                next(null, false);
            }
        });
    });

passport.use(strategy);
passport.use(JobSeeker.createStrategy());

router.use(passport.initialize());

// Register
router.post('/register', (req, res) => {
    if (
        req.body.username &&
        req.body.password &&
        req.body.firstname &&
        req.body.lastname &&
        req.body.birthdate
    ) {
        JobSeeker.findOne({ username: req.body.username }, // Check if job seeker already exists in database using email (username)
            (err, jobSeeker) => {
                if (err) {
                    res.status(401).json(err);
                } else if (!jobSeeker) {
                    let newJobSeeker = new JobSeeker({
                        username: req.body.username,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        birthdate: req.body.birthdate
                    });
                    JobSeeker.register(
                        newJobSeeker,
                        req.body.password,
                        (err) => {
                            if (err) {
                                res.status(401).json(err)
                            } else {
                                res.status(201).json({ message: "registration successful." });
                            }
                        });
                } else {
                    res.status(401).json({ message: "this email is already registered as a username." });
                }
            });
    } else {
        res.status(401).json({ message: "email, password, firstname, lastname and birthdate required." });
    }
});

// Login
router.post("/login", (req, res) => {
    if (req.body.username && req.body.password) {
        const username = req.body.username;
        const password = req.body.password;
        // Authenticate

        JobSeeker.findOne({ username: username },
            function (err, jobSeeker) {

                if (err) {
                    res.status(401).json(err);
                } else if (!jobSeeker) {
                    res.status(401).json({
                        message: "job seeker not registered."
                    });
                }
                jobSeeker.authenticate(
                    password,
                    function (err, jobSeeker) {
                        if (err) {
                            res.status(401).json(err)
                        }
                        if (jobSeeker) {
                            const payload = { id: jobSeeker.id }; // Concept not understood here
                            const token = jwt.sign(payload, jwtOptions.secretOrKey); // Concept not understood here
                            res.status(200).json({
                                message: "login successful.",
                                token: token
                            });
                        } else {
                            res.status(401).json({
                                message: "invalid password."
                            });
                        }
                    });
            });

    } else {
        res.status(401).json({
            message: "missing username or password"
        });
    }
});

// Get all jobs
router.get('/jobs', passport.authenticate(
    "jwt", {session: false}),
    async function (req, res) {
    const jobs = await Job.find();
    return res.json(jobs);
});

// Get specific job based on id
router.get('/jobs/:id', passport.authenticate(
 "jwt", {session: false}),
    async function (req, res) {
    const job = await Job.find({ _id: req.params.id });
    return res.json(job);
});

// Post a job to jobs database
router.post('/job', async function (req, res) {
    const job = new Job({
        title: req.body.title
    });
    await job.save();
    res.send(job);
});

// Bulk add jobs to database
router.post('/jobs', async function (req, res) {
    await Job.insertMany(jobsArray, (error, doc) => {
        if (error) {
            res.status(401).json({ message: "Unable to add jobs to database" });
            console.log(error)
        }
        else {
            res.status(201).json({ message: "Jobs saved to database" });
        }
    });
});

//Delete all jobs from database
router.delete('/jobs', async function (req, res) {
    try {
        await Job.deleteMany();
        res.status(201).json({ message: "All jobs deleted from database!" });
    }
    catch {
        res.status(401).json({ message: "There was an error in connecting to the database!" });
    }
});








module.exports = router;


