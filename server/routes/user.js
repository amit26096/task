const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.view);

router.get('/profile', userController.profile);
router.get('/market', userController.market);
router.post('/', userController.insert);
router.get('/dash', userController.dash);
router.get('/sell/:id', userController.sell);


module.exports = router;