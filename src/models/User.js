const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const Task = require("../models/Task");


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    unique:true,
    required: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Incorrect Email");
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Your Password cannot be password");
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error("Age cannot be negative");
      }
    }
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }],
  avatar:{
    type:Buffer
  }
},{
  timestamps:true
});

UserSchema.virtual('tasks',{
  ref:'Task',
  localField:'_id',
  foreignField:'owner'
});
//here in below code instead of writing 
//getPublicProfile we can write .toJSON so that we can call only user in the routerside
UserSchema.methods.getPublicProfile= function(){
  
  const user=this;
  const userObject=user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  
  return userObject;
}

UserSchema.methods.generateAuthToken=async function (){

  const user=this;
  const token=await jwt.sign({_id:user._id.toString()},process.env.AUTH_SECRET_KEY);
  user.tokens=user.tokens.concat({token});  
  await user.save();
  return token;
}

UserSchema.statics.findByCredentials=async(email,password)=>{

  var user=await User.findOne({ email });

  if(!user)
    throw new Error("Unable to login");

  var isMatch=await bcrypt.compare(password,user.password);

  if(!isMatch)
    throw new Error("Unable to Login");

    return user;
}

UserSchema.pre('save',async function(next){
    
    var User=this;
    if(User.isModified('password'))
        User.password=await bcrypt.hash(User.password,8);
    next();
})

UserSchema.pre('remove',async function(next){
  var user=this;
  await Task.deleteMany({owner:user._id});
  next()
})

const User = mongoose.model("User",UserSchema);

module.exports=User;