var express = require('express');
var {Todo} = require ('../models/todo');
var {User} = require('../models/user');
var router = express.Router();
const _ = require('lodash');
var {ObjectID} = require('mongodb');

// the authenticate middleware method
var authenticate = (req , res , next)=>{

  var token = req.header('x-auth');

  User.findByToken(token).then((user)=>{

    if(!user){

      res.status(401).send();

    }
    // modify the request OBJECT

    req.user = user;
    req.token = token;
    next();

  }).catch((e)=>{
    res.status(401).send();


  });

};

// post todos
router.post('/todos',authenticate ,(req , res) =>{

//console.log(req.body);

  // making the instance of the todo and save the data
  // we get from the user in that new instance


  var todo = new Todo({
    text: req.body.text ,
    _creator: req.user._id
  });
  // send the todo instance that we create with the new data
  // we got to the database and return the doc in the console
  todo.save().then((doc)=>{

    res.send(doc);

  },(e)=>{
    res.status(400).send(e);

  });




});

//get toodos route
router.get('/todos', authenticate,(req , res)=>{
  Todo.find({
    _creator: req.user._id
  }).then((todos)=>{

    //send an object with a property that is an array
    // named todos and it's value are the todos form
    // the todos in the then method above
    res.send({todos: todos})

  },(e)=>{

    res.status(400).send(e);



  });



});


//get Single Todo with an ID

router.get('/todos/:id' ,authenticate, ( req,res)=>{

  var id = req.params.id;

  // validate the ID using the isValid
  if(!ObjectID.isValid(id)){

    return res.status(404).send();

  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo)=>{

    if(!todo){
      return res.status(404).send();
    }

    res.send({todo: todo})
  }).catch((e)=> {

    res.status(400).send();
  });

});

// delete a Single Todo request
router.delete('/todos/:id',authenticate ,(req , res)=>{

  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }
  Todo.findOneAndRemove({
    _id:id,
    _creator: req.user._id
  }).then((todo)=>{
    if(!todo){
      return res.status(404).send();

    }

    res.send(todo);

  }).catch((e)=>{

    return res.status(404).send();
  });



});



// update the single todo route

router.patch('/todos/:id',authenticate ,(req , res) => {

  var id = req.params.id;

  var body = _.pick(req.body,['text' , 'completed']);
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.completed) && body.completed ){

    body.completedAt = new Date().getTime();
  }else{

    body.completed = false ;
    body.completedAt = null ;

  }

  Todo.findOneAndUpdate({
      _id:id ,
      _creator: req.user._id
    } ,
    {$set:body} ,
    { new: true} ).then(
    (todo)=>{
      if(!todo){
        return res.status(404).send();
      }

      res.send({todo});

    }).catch((e)=>{

    res.status(400).send();
  });


});


// post a User
router.post('/Users', (req , res) =>{

  var body =_.pick(req.body , ['email' , 'password' , 'firstname', 'lastname']);

  var user = new User(body);

  // send the todo instance that we create with the new data
  // we got to the database and return the doc in the console
  user.save().then((doc)=>{

    return doc.generateAuthToken();

  }).then((token)=>{

    res.header('x-auth', token).send(user);

  }).catch((e)=>{
    res.status(400).send(e);

  });

});



// sign in a user ROUTE
router.post('/users/login',(req, res )=> {

  // get the email and the body from the request body
  var body =_.pick(req.body , ['email' , 'password']);

  // verify if the user exist
  // make a model method to find a user by credentials
  User.findByCredentials(body.email , body.password)
    .then((user)=>{

      // generate the new token for the new device that is logging in
      return user.generateAuthToken().then((token)=>{
        // send the token in the header of the response
        res.header('x-auth', token).send(user);

      });

    }).catch((e)=>{
    res.status(400).send();
  })
});

// logout Route
router.delete('/users/me/token', authenticate, (req, res)=>{

  req.user.removeToken(req.token).then(()=>{

    res.status(200).send();
  }).catch((e)=>{
    res.status(400).send();
  });
});

// making a route with the auth manually
router.get('/users/me',authenticate,(req , res) => {

  res.send(req.user);

});

module.exports = {router: router};
