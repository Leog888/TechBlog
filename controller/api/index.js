const router = require('express').Router();
const users = require('./users.js');
const posts = require('./posts');

router.use('/users', users);
router.use('/posts', posts);

module.exports = router;