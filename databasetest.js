const mongoose = require('mongoose');
const { isEmail, isUrl } = require ('validator');


const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    github: {
        type: String,
        trim: true,
        validate: [isUrl, 'Please enter a valid URL']
    },
    profilePicture: {

    },
    cv: {

    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minLength: [6, 'Minimum password length is 6 characters']
    },
    offers: [offerSchema] 
});

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true,
        validate: [isUrl, 'Please enter a valid URL']
    },
    nameEmployer: {
        type: String,
        required: true,
        trim: true
    },
    emailEmployer: {
        type: String,
        trim: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    phoneEmployer: {
        type: String,
        trim: true
    },
    adress: {
        type: String,
        trim: true
    },
    origin: {
        type: String,
        required: true,
        trim: true,
        enum: ['Spontaneous solicitation', 'Job offer']
    },
    status: {
        type: String,
        required: true,
        trim: true,
        enum: ['Interested', 'CV sent', 'Negative', 'Interview']
    },
    comments: {
        type: String,
        required: true,
        trim: true
    },
});


const User = mongoose.model('User', userSchema);

module.exports = User;
