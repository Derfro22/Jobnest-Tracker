require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// const findOfferById = (offers, offerId) => {
//     return offers.find(offer => offer._id.toString() === offerId.toString());
//   };

//   module.exports = {
//     findOfferById,
//   };

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

module.exports.create_new_offer = async (req, res) => {
    try {
        // Affichage du token JWT pour vérification
        console.log("Token JWT:", req.cookies.jwt);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token décodé:", decoded);

        const userId = decoded.id;
        console.log("ID utilisateur:", userId);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Utilisateur avant la mise à jour:", user);

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

        console.log("Données reçues:", req.body);

        user.offers.push({
            title,
            website,
            nameEmployer,
            emailEmployer,
            phoneEmployer,
            address,
            origin,
            status, 
            comments
         });

        await user.save();

        console.log("Utilisateur après la mise à jour:", user);

        res.status(201).json({ message: "Offer added successfully" });
    } catch (error) {
        console.error("Erreur dans create_new_offer:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports.home_get = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('offers');

        console.log("offerIds :", offerIds); // Ajoutez cette ligne
        console.log("Offres récupérées :", user.offers);

        res.render('home', { offers: user.offers });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).render('home', { offers: [] });
    }
};

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1});
    res.redirect('/');
}



