const express = require("express");
const User = require("../models/User");
const Auth = require("../middleware/Auth");
const sharp = require("sharp");
const multer = require("multer");
const email=require('../email/account');
const router = express.Router();


var upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a image"));
    }
    cb(undefined, true);
  },
});

router.post("/users/signup", async (req, res) => {
  const NewUser = new User(req.body);

  try {
    var user = await NewUser.save();
    var token = await user.generateAuthToken();
    email.senWelcomeEmail(user.email,user.name);
    res.status(201).send({ user: user.getPublicProfile(), token });
  } catch (e) {
    console.log(e);
    res.status(400).send({ Error: e });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user: user.getPublicProfile(), token }); //instead of user.getPublicProfile we can write user
  } catch (e) {
    console.log(e);
    res.status(400).send(e.toString());
  }
});

router.post("/users/logout", Auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokens) => {
      return tokens.token !== req.token;
    });
    await req.user.save();
    res.send({ status: "Logged out" });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error while logging out ");
  }
});

router.post("/users/logoutAll", Auth, async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    req.user.save();
    res.send({ status: "Logged out of all Devices" });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/users/me/avatar",Auth,upload.single("avatar"),async (req, res) => {
    
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get("/users/me", Auth, async (req, res) => {
  res.send(req.user.getPublicProfile());
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) throw new Error("Invalid Request");
    res.set("Content-type", "image/png");
    res.send(user.avatar);
    } catch (e) {
    console.log(e);
     res.send(e.toString());
  }
});

router.patch("/users/me", Auth, async (req, res) => {
  const parameter = ["name", "age", "email", "password"];
  const pbodys = Object.keys(req.body);
  const isValid = pbodys.every((pbody) => parameter.includes(pbody)); //this line is shorhand for function that only has return statement

  if (!isValid) {
    return res.status(404).send({ Error: "Invalid parameters passed" });
  }

  try {
    const user = req.user;
    pbodys.forEach((para) => (user[para] = req.body[para]));
    await user.save();

    res.send(user.getPublicProfile());
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete("/users/me", Auth, async (req, res) => {
  try {
    email.sendLeavingEmail(req.user.email,req.user.name);
    req.user.remove();
    res.send({ status: "Your Account has been removed" });
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

router.delete("/users/me/avatar", Auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (e) {
    console.log(e);
    res.send(e.toString());
  }
});

module.exports = router;
