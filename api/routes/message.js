'use strict'

var express = require('express');
var MessageController = require('../controllers/message');
var api = express.Router();
var md_Auth = require('../middlewares/authenticated');

api.get('/probandoM', md_Auth.ensureAuth, MessageController.probandoM);
api.post('/message', md_Auth.ensureAuth, MessageController.sendMessage);
api.get('/myMessages/:page?', md_Auth.ensureAuth, MessageController.getReceivedMessages);
api.get('/messages/:page?', md_Auth.ensureAuth, MessageController.getEmmitedMessages);
api.get('/unviewed', md_Auth.ensureAuth, MessageController.getUnviewedMessage);
api.get('/setMessage', md_Auth.ensureAuth, MessageController.setViewedMessages);
module.exports = api;
