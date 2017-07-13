const _ = require('lodash');
var express =require('express');
var bodyParser = require('body-parser');
require ('./server/db/mongoose');
//const jwt = require('jsonwebtoken');
var path = require('path');
var {router} = require('./server/routes/api');
var app = express();


app.set('view engine' , 'hbs');

// This line make the default path to be the dist folder for the render fn for ex
var publicPath = path.resolve(__dirname, 'dist');

app.use(express.static(publicPath));


//
// app.set('views' , __dirname);


//app.use('/static', express.static(path.join(__dirname, 'dist')));
// set the dist folder to be accessible from making a http request

//app.use(express.static(__dirname, '/dist'));

// set the views for the anglar app to make the node app render in the views folder


//app.set('views' , publicPath);




// this make us be able to send and receive json
app.use(bodyParser.json());



app.listen(3000, () =>{
  console.log('started on the port 3000');
});




// this set the any routes to be dealt with the router from express
// that is loaded from api.js file in the routes folder
// // notice that we required the router from the api.js file
app.use('/', router);


// make a 404 route ... that return the index from the views folder
app.use(function (req, res ,next) {
  return res.render('index',{});

});

module.exports = {app};
