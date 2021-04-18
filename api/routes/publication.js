'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');
var api = express.Router();
var md_Auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_Upload = multipart({uploadDir: './uploads/publication'});

api.get('/probando', md_Auth.ensureAuth, PublicationController.probando);
api.post('/publication', md_Auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_Auth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id', md_Auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id', md_Auth.ensureAuth, PublicationController.deletePublication);
api.post('/uploadImagePub/:id', [md_Auth.ensureAuth, md_Upload], PublicationController.uploadImage);
api.get('/getImagePub/:imageFile', PublicationController.getImageFile);


module.exports = api;
