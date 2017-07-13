/**
 * Created by MUHAMAD on 06/24/2017.
 */

var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// we make the schema to be able tp add our instance methods to the model
const bcrypt = require('bcryptjs');
// we make the schema to be able tp add our instance methods to the model
var UserSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: (value)=>{
        return validator.isEmail(value);

      } ,
      message: '{value} is not a vaild email'
    }
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstname:{
    type: String,
    required: true,
    minlength: 1
  },

  lastname:{
    type: String,
    required: true,
    minlength: 1
  },

  tokens: [{

    access: {
      type:String,
      required:true

    },

    token: {

      type:String,
      required:true

    }
  }]

});

// this method for updating the user with the token in the DB and return
// the token in the response to the post request of registering a user or login a user
UserSchema.methods.generateAuthToken = function () {

  // the most importnat phrase to make an Instance method
  var user = this;


  var access = 'auth';

  var token = jwt.sign({_id: user._id.toHexString(), access } , '123abc').toString();

  user.tokens.push({
    access: access ,
    token: token
  });

  // return a promise to chain another promise in the server.js
  return user.save().then(()=> token);
};

UserSchema.statics.findByToken = function (token) {
  // bind the model in the this keyword
  var User = this;

  var decoded;

  try {

    decoded = jwt.verify(token , '123abc');

  } catch(e) {
    // if the jwt cannot verify the token
    // this will make a promise and then reject it
    // to return to the server ( findByToken ) method
    // to the catch phrase for the error of the promises
    return new Promise((resolve , reject)=>{
      reject();
    });
  }

  // this return a promise with the data of the found user
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token ,
    'tokens.access': 'auth'
  });

};
// a middleware to be executed before the save of a user
UserSchema.pre('save',function (next) {
  var user = this;

  if(user.isModified('password')){

    // generating the salt that will be added to the password
    bcrypt.genSalt(10 , (err, salt) =>{

      // hashing the password by adding the salt to the password then hash
      bcrypt.hash(user.password , salt , (err,hash)=>{

        // setting the user password to be equal to the generated hash
        user.password = hash;
        next();
      } )
    })
  }else{
    next();

  }

});

UserSchema.statics.findByCredentials = function (email , password) {
  var User = this;

  // this return the promise of the mongoose find method
  return User.findOne({email}).then((user)=>{
    if(!user){
      return Promise.reject();
    }
    // this is using an manual Promise because bcrypt is
    // not working with promises itself so we make a wrapper for it
    return new Promise((resolve , reject)=>{
      bcrypt.compare(password , user.password , (err , res)=>{

        if(res){
          resolve(user);
        }else{
          reject();
        }
      })

    });
  }).catch((e)=>{
    return Promise.reject();
  });

};

UserSchema.methods.removeToken = function (token) {

  var user =this;

  return user.update({
    $pull: {
      tokens: {
        token: token
      }
    }
  })

};
var User = mongoose.model('User', UserSchema);

// module.exports = { User };
module.exports  = {User: User};
