const mongoose = require('mongoose');
const validator=require('validator');


mongoose.connect(process.env.MONGODB_LOCAL_PATH, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true,
    useFindAndModify:false
});




