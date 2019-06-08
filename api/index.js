const router = require('express').Router();

router.use('/courses', require('./courses'));
router.use('/users', require('./users'));
module.exports = router;
