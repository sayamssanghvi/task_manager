const mongoose = require('mongoose');
const validator = require('validator');

const TaskSchema = new mongoose.Schema({
  desc: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }
},{
  timestamps:true
});

const Task = mongoose.model("Task",TaskSchema);

module.exports=Task;
