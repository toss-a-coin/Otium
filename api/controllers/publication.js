'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res){
  res.status(200).send({message: 'Hola mundo desde publitacion'});
}
function savePublication(req, res){
  var params = req.body;

  if(!params.text) return res.status(200).send({message: 'Debes de enviar Texto'});

  var publication = new Publication();

  publication.text = params.text;
  publication.file = 'null';
  publication.user = req.user.sub;
  publication.created_at = moment().unix();

  publication.save((err, publicationSaved) => {
    if(err) return res.status(500).send({message: ' Error al hacer la publicacion'});

    if(!publicationSaved) return res.status(404).send({message: 'La publicacion no ha sido guardada'});

    return res.status(200).send({publication: publicationSaved});
  });
}

function getPublications(req, res){
  var page = 1
  if(req.params.page){
    page = req.params.page;
  }

  var itemsPerPage = 4;

  Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
    if(err) return res.status(500).send({message: ' Error al intentar un seguimiento'});

    var follows_clean = [];
    follows.forEach((follow) => {
        follows_clean.push(follow.followed);
    });
    Publication.find({user: {'$in': follows_clean}}).sort('-created_at').populate('user').paginate(page, itemsPerPage,(err, publications, total) =>{
        if(err) return res.status(500).send({message: ' Error al devolver las publicaciones'});

        if(!publications) return res.status(404).send({message: 'No hay publicaciones'});

        return res.status(200).send({
          total_items: total,
          pages: Math.ceil(total/itemsPerPage),
          page: page,
          publications
        })
    });
  });
}

function getPublication(req, res){
  var publicationId = req.params.id;

  Publication.findById(publicationId, (err, publication) => {
    if(err) return res.status(500).send({message: 'Error al devolver la publicacion'});

    if(!publication) return res.status(404).send({message: 'No existe la publicacion'});

    return res.status(200).send({message: publication});
  });
}

function deletePublication(req, res){
  var publicationId = req.params.id;

  Publication.find({'user': req.user.sub, '_id': publicationId}).remove((err) =>{
    if(err) return res.status(500).send({message: 'Error al borrar las publicaciones'});

    // if(!publicationRemove) return res.status(404).send({message: 'No existe la publicacion a borrar'});

    return res.status(200).send({message: 'La publicacion ha sido eliminada'});
  });
}

//Subir archivos (imagen).
function uploadImage(req, res){
  var publicationId = req.params.id;

  if(req.files){
    var file_path = req.files.image.path;
    var file_Split = file_path.split('\\');
    var file_Name = file_Split[2];
    var ext_Split = file_Name.split('\.');
    var file_Ext = ext_Split[1];

  if(file_Ext === 'png' || file_Ext === 'jpg' || file_Ext === 'jpeg' || file_Ext === 'gif'){

    Publication.findOne({'user': req.user.sub, '_id': publicationId}).exec((err, publication) => {
      if(publication){
            //Actualizar el documento de la publicacion.
              Publication.findByIdAndUpdate(publicationId, {file: file_Name}, {new: true}, (err,publicationUpdated) => {
              if(err) return res.status(500).send({message: 'Error en la peticicion'});

              if(!publicationUpdated) return res.status(404).send({message: 'No se ha podido realizar la actualizacion'});

              return res.status(200).send({publication: publicationUpdated});
              });
    }else{
      return removeFiles(res, file_path,'No tienes permiso para actualizar esta publicacion');
    }
    });

  }else{
    return removeFiles(res, file_path,'Extension no valida');
  }
  }else{
    return res.status(200).send({message: ' No se han subido imagenes'});
  }

}

function removeFiles(res, file_path, message){
  fs.unlink(file_path, (err) => {
     return res.status(200).send({message: message});
  });
}

function getImageFile(req, res){
  var image_File = req.params.imageFile;
  var path_File = './uploads/publication'+ image_File;

  fs.exists(path_File, (exists) => {
    if(exists){
      res.sendFile(path.resolve(path_File));
    }else{
      res.status(200).send({message: 'No existe la imagen'});
    }
  });
}

module.exports = {
  probando,
  savePublication,
  getPublications,
  getPublication,
  deletePublication,
  uploadImage,
  getImageFile
}
