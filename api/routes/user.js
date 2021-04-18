'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();
var md_Auth = require('../middlewares/authenticated');
var multiparty = require('connect-multiparty');
var md_Upload = multiparty({uploadDir: './uploads/users'})

api.get('/home', UserController.home);
api.get('/prueba', md_Auth.ensureAuth, UserController.prueba);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_Auth.ensureAuth , UserController.getUser);
api.get('/users/:page', md_Auth.ensureAuth , UserController.getUsers);
api.get('/counters/:id?', md_Auth.ensureAuth, UserController.getCounters);
api.put('/update/:id', md_Auth.ensureAuth, UserController.updateUser);
api.post('/uploadImage/:id', [md_Auth.ensureAuth, md_Upload], UserController.uploadImage);
api.get('/getImage/:imageFile', UserController.getImageFile);

module.exports = api;
