'use strict'

// var path = require('path');
// var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

function saveFollow(req, res){
  var params = req.body;

  var follow = new Follow();
  follow.user = req.user.sub;
  follow.followed = params.followed;

  follow.save((err, followSaved) => {
      if(err) return res.status(500).send({message:'Error al guardar.'});

      if(!followSaved) return res.status(404).send({message: 'El follow no llego.'})

      return res.status(200).send({follow: followSaved});
  });
}

function deleteFollow(req, res){
  var userId = req.user.sub;
  var followId = req.params.id;

  Follow.find({'user': userId, 'followed': followId}).remove((err) => {
    if(err) return res.status(500).send({messsage: 'Error al dejar de seguir'})

    return res.status(200).send({message: 'El follow se ha eliminado'})

  });
}

function getFollowers(req, res) {
  var userId = req.user.sub;
  var page = 1;
  var itemsPerPage = 4;

  if(req.params.id && req.params.page){
    userId = req.params.id;
  }
  if(req.params.page){
    page = req.params.page;
  }else{
    page = req.params.id;
  }
  Follow.find({user:userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
    if(err) return res.status(500).send({message: 'Error en el servidor'});

    if(!follows) return res.status(404).send({message: 'No estas siguiendo a ningun usuario'});

    return res.status(200).send({
      total:total,
      pages: Math.ceil(total/itemsPerPage),
      follows
    });
  });
}

function getFollowedUsers(req, res){
  var userId = req.user.sub;
  var page = 1;
  var itemsPerPage = 4;

  if(req.params.id && req.params.page){
    userId = req.params.id;
  }
  if(req.params.page){
    page = req.params.page;
  }else{
    page = req.params.id;
  }
  Follow.find({followed: userId }).populate('user followed').paginate(page, itemsPerPage, (err, follows, total) => {
    if(err) return res.status(500).send({message: 'Error en el servidor'});

    if(!follows) return res.status(404).send({message: 'Nadie te esta siguiendo'});

    return res.status(200).send({
      total:total,
      pages: Math.ceil(total/itemsPerPage),
      follows
    });
  });
}

function getMyFollows(req, res){
  var userId = req.user.sub;

  var find = Follow.find({user: userId});

  if(req.params.followed){
    find = Follow.find({followed: userId});
  }

  find.populate('user followed').exec((err, follows) => {
    if (err) return res.status(500).send({message: 'Error en el servidor'});

    if (!follows) return res.status(404).send({message: 'No sigues a nigun usuario'});

    return res.status(200).send({follows});
  });
}




module.exports = {
  saveFollow,
  deleteFollow,
  getFollowers,
  getFollowedUsers,
  getMyFollows
}
