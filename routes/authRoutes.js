const { Router } = require('express');
const authController = require ('../controllers/authController')

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/new-offer', (req, res) => {
    res.render('newOffer');
});
router.post('/new-offer', authController.create_new_offer);

router.get('/', authController.home_get);
router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;