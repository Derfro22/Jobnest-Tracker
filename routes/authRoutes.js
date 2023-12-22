const { Router } = require('express');
const authController = require ('../controllers/authController')

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/profile', authController.profile_get);
router.post('/change-password', authController.changePassword_post);

router.get('/new-offer', (req, res) => {
    res.render('newOffer');
});
router.post('/new-offer', authController.create_new_offer);

router.get('/dashboard', authController.home_get);
router.get('/offer/:offerId', authController.getOfferDetails);
// router.get('/update-offer/:offerId', authController.get_update_offer);
// router.post('/update-offer/:offerId', authController.update_offer);
router.delete('/offer/:offerId', authController.delete_offer);
router.get('*', (req, res) => {
    res.redirect('/');
});

module.exports = router;