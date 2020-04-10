const express=require('express');
const Task=require('../models/Task');
const Auth=require('../middleware/Auth');

const router=express.Router();

router.post('/task',Auth,async (req, res) => {

    // const NewTask = new Task(req.body);
    const NewTask=new Task({
        ...req.body,
        owner:req.user._id
    });

    try {
        var result = await NewTask.save();
        res.status(201).send(result);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});


router.get('/task', Auth,async (req, res) => {

    var match={}
    var sort={}
    if(req.query.completed)
    {
        match.completed= req.query.completed === 'true'
    }
    if(req.query.sortBy)
    {
        var parts=req.query.sortBy.split(':');
        sort[parts[0]]= parts[1] === 'desc' ? -1 : 1
    }

    try {
//  var result = await Task.find({owner:req.user._id});
    await req.user.populate({
        path:'tasks',
        match,
        options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }
    }).execPopulate();
    res.send(req.user.tasks);
    } catch (e) {
        console.log(e);
        res.status(500).send({ Result: 'error' });
    }
})

router.get('/task/:id',Auth ,async (req, res) => {

    try {
        var task=await Task.findOne({_id:req.params.id,owner:req.user._id});
        if (!task)
            return res.status(404).send({
                Result: 'error'
            });
        res.send(task);
    } catch (e) {
        console.log(e);
        res.status(500).send({ Result: 'error' });
    }
})

router.patch('/task/:id',Auth ,async (req, res) => {

    const parameters = ['desc', 'completed'];
    const pbody = Object.keys(req.body);
    const isValid = pbody.every((para) => parameters.includes(para));

    if (!isValid)
       return res.status(404).send({"Error":"Error:invalid Parameter passed"});

    try {
        var result=await Task.findOne({_id:req.params.id,owner:req.user._id});
        pbody.forEach((para)=>{result[para]=req.body[para]})
        await result.save();

        if (!result)
            return res.status(404).send({ Eror: "The ID" + req.params.id + "does not exist" });
       
            res.status(201).send(result);
    }catch (e) {
        console.log(e);
        res.status(501).send(e);
    }
})

router.delete('/task/:id',Auth ,async (req, res) => {

    try {
        var result = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
        if (!result)
            return res.status(404).send({ Error: "error"});

        res.status(201).send(result);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }

})

module.exports=router;