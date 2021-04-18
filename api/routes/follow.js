'use strict'

var express = require('express');
var FollowController = require('../controllers/follow');

var api = express.Router();

var md_Auth = require('../middlewares/authenticated');

api.post('/follow', md_Auth.ensureAuth, FollowController.saveFollow);
api.delete('/deleteF/:id', md_Auth.ensureAuth, FollowController.deleteFollow);
api.get('/followers/:id?/:page?', md_Auth.ensureAuth, FollowController.getFollowers);
api.get('/followeds/:id?/:page?', md_Auth.ensureAuth, FollowController.getFollowedUsers);
api.get('/getMyFollows/:followed?', md_Auth.ensureAuth, FollowController.getMyFollows);
module.exports = api;
