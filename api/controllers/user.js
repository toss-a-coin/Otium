'use strict'
var bcrypt = require('bcrypt-nodejs');

var User = require('../models/user');

var Follow = require('../models/follow');

var Publication = require('../models/publication');


var jwt = require('../services/jwt');

var mongoosePaginate = require('mongoose-pagination');

var fs = require('fs');

var path = require('path');

function home(req, res){
  res.status(200).send({
    message: 'Hola mundo'
  });
}

function prueba(req,res){
  console.log(req.body);
  res.status(200).send({
    message: 'Hola mundo'
  });
}

function saveUser(req, res){
  var params = req.body;
  var user = new User();
  if (params.name && params.lastname && params.nick &&  params.email && params.password){

      user.name = params.name;
      user.lastname = params.lastname;
      user.nick = params.nick;
      user.email = params.email;
      user.role = 'ROLE_USER';
      user.image = null;

      //Controlar los usuarios duplicados.
      User.find({$or: [
                      {email: user.email.toLowerCase()},
                      {nick:  user.nick.toLowerCase()}

      ]}).exec((err, users) => {
        if (err) return res.status(500).send({message: 'Error en la peticion de Usuarios'});

        if (users && users.length >= 1){
          return res.status(200).send({message: ' El usuario que intenta registrar ya existe'});
        }else{
            bcrypt.hash(params.password, null, null, (err, hash) => {
              user.password = hash;

              user.save((err, userSaved) => {
                if (err) return res.status(500).send({message: 'Error al guardar el usuario'})

                if (userSaved){
                  res.status(200).send({user: userSaved});
                }else{
                  res.status(404).send({message: 'No se ha encontrado el usuario'});
                }
              });
          });
        }
      });

      //Cifrar la password y guarda los datos.


  }else {
    res.status(200).send({
      message: 'Envia todos los campos necesarios'
    });
  }
}

function loginUser(req, res){
  var params = req.body;

  var email = params.email;
  var password = params.password;

  User.findOne({email: email}, (err, user) => {
    if(err) return res.status(500).send({message: 'Error en la peticion'});

    if(user){
      bcrypt.compare(password, user.password, (err, check) =>{
        if(check){
          //devolver datos de usuario.
          if (params.gettoken){
            //devolver un token.
            //generar un token.
            return res.status(200).send({token:jwt.createToken(user)});
          }else{
            user.password = undefined;
            user.__v = undefined;
            return res.status(200).send({user});
          }
        }else{
          return res.status(404).send({message: 'El usuario no se ha identificado'});
        }
      });
    }else{
      return res.status(404).send({message: 'El usuario no se ha identificado!!'});
    }
  });
}
//Conseguir los datos de un usuario
function getUser(req, res){
  var userId = req.params.id;

  User.findById(userId, (err, user) => {
    if(err) return res.status(500).send({message: 'Error en la peticion'});

    if(!user) return res.status(404).send({message: 'El usuario no existe'});

    followThisUser(req.user.sub, userId).then((value) => {
      return res.status(200).send({
            user,
            following: value.following,
            followed: value.followeds
          });
      });
    });

}

async function followThisUser(identity_user_id, user_id){
  var following = await Follow.findOne({'user': identity_user_id, 'followed': user_id}).exec((err, follow) => {
      if (err) handleError(err);
      return follow;
    });
  var followed = await Follow.findOne({'user': user_id, 'followed': identity_user_id}).exec((err, follow) => {
      if (err) handleError(err);
      return follow;
    });
  return {
    following: following,
    followed: followed
  }
}

function getUsers(req, res){
  var identity_user_id = req.user.sub;
  var page = 1;

  if(req.params.page){
    page = req.params.page;
  }

  var itemsPerPage = 5;

  User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
    if(err) return res.status(500).send({message: 'Error en la peticion'});

    if(!users) return res.status(404).send({message: 'No hay usuarios disponibles'});

    followUserIds(identity_user_id).then((value) => {
      return res.status(200).send({
        users,
        users_follwing: value.following,
        user_followed: value.followed,
        total,
        pages: Math.ceil(total/itemsPerPage)
      });
    });
  });
}

async function followUserIds(user_id){
  var following = await Follow.find({"user": user_id}).select({'_id': 0, '__uv': 0, 'user': 0}).exec().then((follows)=>{
  var follows_clean=[];

    follows.forEach((follow)=>{
    follows_clean.push(follow.followed);
    });
      return follows_clean;
    }).catch((err)=>{
      return handleerror(err);
    });

  var followed = await Follow.find({"followed": user_id}).select({'_id': 0, '__uv': 0, 'followed': 0}).exec().then((follows)=>{
  var follows_clean=[];
    follows.forEach((follow)=>{
    follows_clean.push(follow.user);
    });
      return follows_clean;
    }).catch((err)=>{
      return handleerror(err);
    });
  return {
  following: following,
  followed: followed
  }
}
function getCounters(req, res) {
  var userId = req.user.sub;
  if(req.params.id){
    getCountFollow(req.params.id).then((value) =>{
      return res.status(200).send({value});
    });
  }else{
    getCountFollow(userId).then((value) => {
      return res.status(200).send({value});
    });
  }
}

async function getCountFollow(user_id) {
  var following = await Follow.count({"user": user_id}).exec((err, count) =>{
    if(err) return handleError(err);
    return count;
  });
  var followed = await Follow.count({"folowed":user_id}).exec((err, count) => {
    if(err) return handleError(err);
  });

  var publications = await Publication.count({"user": user_id}).exec((err, count) =>{
    if(err) return handleError(err);

    return count;
  });
  return {
    following: following,
    followed: followed,
    publications: publications
  }
}
function updateUser(req, res){
  var userId = req.params.id;
  var update = req.body;

  //borrar la password

  delete update.password;

  if(userId != req.user.sub){
    return res.status(500).send({message: 'No tienes permiso para actualizar los datos'});
  }
  User.findByIdAndUpdate(userId, update,{new: true}, (err, userUpdated) => {
  if(err) return res.status(500).send({message: 'Error en la peticicion'});

  if(!userUpdated) return res.status(404).send({message: 'No se ha podido realizar la actualizacion'});

  return res.status(200).send({user: userUpdated});
  });
}

//Subir archivos (imagen).
function uploadImage(req, res){
  var userId = req.params.id;

  if(req.files){
    var file_Path = req.files.image.path;
    console.log(file_Path);

    var file_Split = file_Path.split('\\');
    console.log(file_Split);

    var file_Name = file_Split[2];
    console.log(file_Name);

    var ext_Split = file_Name.split('\.');
    console.log(ext_Split);

    var file_Ext = ext_Split[1];

    if(userId != req.user.sub){
      return removeFiles(res, file_Path,'No tienes permiso para actualizar los datos')
    }

  if(file_Ext === 'png' || file_Ext === 'jpg' || file_Ext === 'jpeg' || file_Ext === 'gif'){
    //Actualizar image en la DB.
    User.findByIdAndUpdate(userId, {image: file_Name}, {new: true}, (err,userUpdated) => {
    if(err) return res.status(500).send({message: 'Error en la peticicion'});

    if(!userUpdated) return res.status(404).send({message: 'No se ha podido realizar la actualizacion'});

    userUpdated.__v = undefined;
    userUpdated.password = undefined;
    return res.status(200).send({user: userUpdated});
    });
  }else{
    return removeFiles(res, file_Path,'Extension no valida');
  }

  }else{
    return res.status(200).send({message: ' No se han subido imagenes'});
  }
}

function removeFiles(res, file_Path, message){
  fs.unlink(file_Path, (err) => {
     return res.status(200).send({message: message});
  });
}

function getImageFile(req, res){
  var image_File = req.params.imageFile;
  var path_File = './uploads/users/'+image_File;

  fs.exists(path_File, (exists) => {
    if(exists){
      res.sendFile(path.resolve(path_File));
    }else{
      res.status(200).send({message: 'No existe la imagen'});
    }
  });
}
module.exports = {
  home,
  prueba,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  getCounters,
  updateUser,
  uploadImage,
  getImageFile
}
