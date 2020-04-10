const jwt = require('jsonwebtoken');
const User=require('../models/User');

var Auth=async(req,res,next)=>{

    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoder = jwt.verify(token, process.env.AUTH_SECRET_KEY);
        const user = await User.findOne({ _id: decoder._id, 'tokens.token': token });

        if(!user)
            throw new Error();
        req.token=token;
        req.user = user;
        next();
    }catch(e){
        console.log(e);
        res.status(401).send("Please Authenticate");
    }
    
}

module.exports=Auth;