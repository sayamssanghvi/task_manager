const express=require('express');
require('./db/mongoose');
const User=require('./models/User');
const Task = require("./models/Task");
const userRouter=require('./routers/userRouter');
const taskRouter=require('./routers/taskRouter');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const app=express();
const port=process.env.PORT;

// app.use((req,res,next)=>{
//     res.status(503).send({result :"The site is under maintenance.We will be back soon"});
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.get('*',(req,res)=>{
    res.status(404).send({Error:"This page does not exist"})
})

app.listen(port,()=>
{
    console.log("Server is up and running "+ port);
})

