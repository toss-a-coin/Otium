'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message= require('../models/message');


function probandoM (req, res){
  res.status(200).send({message: 'Exitoso'});
}

function sendMessage(req,res){
  var params = req.body;

  if(!params.text || !params.receiver) return res.status(200).send({message: 'Rellena los campos necesarios para poder enviar el mensaje.'});

  var message = new Message();
  message.emitter = req.user.sub;
  message.receiver = params.receiver;
  message.text = params.text;
  message.created_at = moment().unix();
  message.viewed = 'false';

  message.save((err, messageSaved) => {
    if(err) return res.status(500).send({message: 'Error al guardar el mensaje.'});

    if(!messageSaved) return res.status(404).send({message: 'Error al enviar el mensaje'});

    return res.status(200).send({message: messageSaved});
  });
}

function getReceivedMessages(req, res){
  var userId = req.user.sub;
  var page = 1;

  if(req.params.page){
    page = req.params.page;
  }

  var itemsPerPage = 4;

  Message.find({receiver: userId}).populate('emitter','name lastname image nick _id').paginate(page, itemsPerPage, (err, messages, total) =>{
    if(err) return res.status(500).send({message: 'Error en la peticion'});
    if(!messages) return res.status(404).send({message: 'No hay mensajes'});

    return res.status(200).send({
      total: total,
      page: Math.ceil(total/itemsPerPage),
      messages: messages
    });
  });
}

function getEmmitedMessages(req, res){
  var userId = req.user.sub;
  var page = 1;

  if(req.params.page){
    page = req.params.page;
  }

  var itemsPerPage = 4;

  Message.find({emmiter: userId}).populate('emmiter receiver','name lastname image nick _id').paginate(page, itemsPerPage, (err, messages, total) =>{
    if(err) return res.status(500).send({message: 'Error en la peticion'});
    if(!messages) return res.status(404).send({message: 'No hay mensajes'});

    return res.status(200).send({
      total: total,
      page: Math.ceil(total/itemsPerPage),
      messages: messages
    });
  });
}

function getUnviewedMessage(req, res){
  var userId = req.user.sub;

  Message.count({receiver: userId, viewed: 'false'}).exec((err, count) => {
      if(err) return res.status(500).send({message: 'Error en la peticion'});

      return res.status(200).send({
        'unviewed': count
      });
  });
}

function setViewedMessages(req, res){
  var userId = req.user.sub;

  Message.update({receiver: userId, viewed: 'false'}, {viewed: 'true'}, {"multi": true},(err, messageUpdated) => {
    if(err) return res.status(500).send({message: 'Error en la peticion'});

    return res.status(200).send({
      messages: messageUpdated
    });
  });
}


module.exports = {
  probandoM,
  sendMessage,
  getReceivedMessages,
  getEmmitedMessages,
  getUnviewedMessage,
  setViewedMessages
}
