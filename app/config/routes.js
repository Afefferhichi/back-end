const express = require('express');
const router = express.Router();

const users_controller = require('../controllers/users');
const {auth, allUsers, addUser, deleteUser, login, profile, register, updateUser} = users_controller;

const templates = require('../controllers/templates')

// Users part
router.get('/allUsers', auth, allUsers);
router.post('/addUser', auth, addUser);
router.delete('/deleteUser/:id', auth, deleteUser);
router.post('/login', login);
router.get('/profile', auth, profile);
router.post('/register', register);
router.post('/updateUser/:id', auth, updateUser);


// Templates part
router.post('/templates', auth, templates.create);

module.exports = router;