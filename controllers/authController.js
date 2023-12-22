require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: ''};

    //incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    //incorrect email
    if (err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
    }

    //duplicate error code
    if (err.code === 11000) {
        errors.email = 'that email is already registerd';
        return errors;
    }

    // validation errorss
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}
module.exports.signup_post = async (req, res) => {
    const {
        email,
        password,
        firstname,
        lastname,
        github
    } = req.body;

    try {
        const user =  await User.create({
            email,
            password,
            firstname,
            lastname,
            github
         });
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
    }
}
module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
    }
}
module.exports.profile_get = async (req, res) => {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET, async (_, decodedToken) => {
        try {
            const user = await User.findById(decodedToken.id);
            res.render('profile', { user });
        } catch (error) {
            console.error("Erreur :", error);
            res.status(500).render('profile', { user: {} });
        }
    })
};

module.exports.getOfferDetails = async (req, res) => {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET, async (_, decodedToken) => {
        try {
            const offerId = req.params.offerId;
            console.log(offerId);
            const user = await User.findById(decodedToken.id).populate('offers');
            const offer = user.offers.find(offer => offer._id == offerId);
            res.render('offer', { offer });
            console.log("a");
        } catch (error) {
            console.error("Erreur :", error);
            res.status(500).render('offer', { offer: {} });
        }
    })
};

module.exports.create_new_offer = async (req, res) => {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        try {
            const {
                title,
                website,
                nameEmployer,
                emailEmployer,
                phoneEmployer,
                address,
                origin,
                status,
                comments
            } = req.body;
            await User.findByIdAndUpdate(decodedToken.id, {
                $push: {
                    offers: {
                        title,
                        website,
                        nameEmployer,
                        emailEmployer,
                        phoneEmployer,
                        address,
                        origin,
                        status,
                        comments
                    }
                }
            });
            res.status(201).json({ message: "Offer added successfully", redirect: '/' });
        } catch (error) {
            console.log(error)
            res.status(400).json(err);
        }
    })
};


module.exports.home_get = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('offers');

        res.render('dashboard', { offers: user.offers });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).render('dashboard', { offers: [] });
    }
};

module.exports.delete_offer = async (req, res) => {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        try {
            const offerId = req.params.offerId;
            await User.findByIdAndUpdate(decodedToken.id, {
                $pull: {
                    offers: {
                        _id: offerId
                    }
                }
            });
            res.status(201).json({ message: "Offer deleted successfully", redirect: '/' });
        } catch (error) {
            console.log(error)
            res.status(400).json(err);
        }
    })
};

module.exports.changePassword_post = async (req, res) => {
    const token = req.cookies.jwt;
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        try {
            const { currentPassword, newPassword } = req.body;
            console.log("old", currentPassword);
            console.log("new", newPassword);
            const user = await User.findById(decodedToken.id);
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw Error('incorrect password');
            }
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash(newPassword, salt);
            await User.findByIdAndUpdate(decodedToken.id, {
                password
            });
            res.status(201).json({ message: "Password changed successfully" });
        } catch (error) {
            console.log(error)
            res.status(400).json(err);
        }
    })
};
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1});
    res.redirect('/');
}



