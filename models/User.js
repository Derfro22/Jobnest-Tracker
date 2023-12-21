const mongoose = require('mongoose');
const { isEmail } = require ('validator');
const bcrypt = require ('bcrypt');

const githubLinkRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
const urlRegex = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
const phoneRegex = /^(\+|00)?[0-9 \-\(\)\.]{7,32}$/;



const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    website: {
        type: String,
        trim: true,
        validate: [urlRegex, 'Please enter a valid url']
    },
    nameEmployer: {
        type: String,
        required: true
    },
    emailEmployer: {
        type: String,
        trim: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    phoneEmployer: {
        type: String,
        trim: true,
        validate: [phoneRegex, 'Please enter a valid phone number']
    },
    adress: {
        type: String
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
        validate: [githubLinkRegex, 'Please enter a valid github link']
    },
    profilePicture: {
        type: String,
        trim: true
    },
    cv: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minLength: [6, 'Minimum password length is 6 characters']
    },
    offers: [offerSchema] 
});



// fire a function  after doc saved to db
userSchema.post('save', function (doc, next) {
    console.log('new user was created', doc);
    next();
});

// fire a function before doc saved to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// static method to login 
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
       const auth = await bcrypt.compare(password, user.password);
       if (auth) {
        return user;
       }
       throw Error('incorrect password');
    }
    throw Error('incorrect email');
}

const User = mongoose.model('user', userSchema);

module.exports = User;