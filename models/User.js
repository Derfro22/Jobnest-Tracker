const mongoose = require('mongoose');
const { isEmail, isUrl } = require ('validator');
const bcrypt = require ('bcrypt');


const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        trim: true,
        validate: [value => isUrl(value), 'Please enter a valid URL']
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
        validate: [value => isEmail(value), 'Please enter a valid email']
    },
    github: {
        type: String,
        trim: true,
        validate: [value => isUrl(value), 'Please enter a valid URL']
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