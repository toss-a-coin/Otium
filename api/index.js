'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//conexion DB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Otium',{useNewUrlParser:true, useUnifiedTopology: true })
          .then( () => {
            console.log('La conexion a la base de datos Otium se ha realizado de manera exitosa');

            //crear servidor
            app.listen(port,() => {
              console.log('Servidor corriendo en http://localhost:3800');
            })
          })
          .catch( err => console.log(err));
