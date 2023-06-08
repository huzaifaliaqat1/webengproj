const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require("./models/Users");
const cors = require("cors");
const axios = require("axios");

app.use(express.json());
app.use(cors());

const mongoURI = 'mongodb://127.0.0.1:27017/Children_Progress';
  async function main() {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then(() => {
        console.log('Connected to MongoDB');
        // Start your server or perform other operations
      });
    } catch (error) {
      handleError(error);
    }
  }
  
  main().catch(console.error);
  
  const db = mongoose.connection;

app.post("/createUser", async (req, res) => {
  console.log("POST REQUEST");
  const name = req.body.name;
  const password = req.body.password;
  const LessonEnglish = req.body.LessonsEnglish;
  const LessonMaths = req.body.LessonsMaths;
  const LessonScience = req.body.LessonsScience;
  const myobj = {name: name, password: password, LessonsEnglish: LessonEnglish, LessonsMaths: LessonMaths, LessonsScience: LessonScience};
  //if username and password are empty fields dont create a user
  if (myobj.name === "" || myobj.password === "") {
    console.log("Empty username or password");
    res.send({ error: "Please enter both username and password" });
    return;
  }
  //check if user already exists
  const existingUser = await db.collection("users").findOne({ name: req.body.name });
  console.log("existingUser:", existingUser);
  if (existingUser !== null) {
    console.log("User already exists");
    res.send({ err: "User already exists" });
    return;
  }
  //create a new user
  db.collection("users").insertOne(myobj, function (err, result) {
    if (err) throw err;
    console.log("1 document inserted");
    res.send("POST REQUEST");
  });
});



app.post("/incUserEnglish", async (req, res) => {
  console.log("POST REQUEST");
  const obj = await db.collection("users").findOne({ name: req.body.name, password: req.body.password });
  if (obj) {
      // lesson not completed
    const updatedUser =  {
      ...obj,
      LessonsEnglish: obj.LessonsEnglish.map(lesson => {
        if (lesson.id === req.body.id) {
          return { ...lesson, state: 1 };
        }
        return lesson;
      })
    };
    db.collection("users").updateOne({ _id: obj._id }, { $set: { LessonsEnglish: updatedUser.LessonsEnglish } }, function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
    });
    
  } else {
    res.send("User not found");
  }
});

app.post("/incUserMaths", async (req, res) => {
  console.log("POST REQUEST");
  const obj = await db.collection("users").findOne({ name: req.body.name, password: req.body.password });
  if (obj) {
      // lesson not completed
    const updatedUser =  {
      ...obj,
      LessonsMaths: obj.LessonsMaths.map(lesson => {
        if (lesson.id === req.body.id) {
          return { ...lesson, state: 1 };
        }
        return lesson;
      })
    };
    db.collection("users").updateOne({ _id: obj._id }, { $set: { LessonsMaths: updatedUser.LessonsMaths } }, function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
    });

  } else {
    res.send("User not found");
  }
});

app.post("/incUserScience", async (req, res) => {
  console.log("POST REQUEST");
  const obj = await db.collection("users").findOne({ name: req.body.name, password: req.body.password });
  if (obj) {
      // lesson not completed
    const updatedUser =  {
      ...obj,
      LessonsScience: obj.LessonsScience.map(lesson => {
        if (lesson.id === req.body.id) {
          return { ...lesson, state: 1 };
        }
        return lesson;
      })
    };
    db.collection("users").updateOne({ _id: obj._id }, { $set: { LessonsScience: updatedUser.LessonsScience } }, function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
    });

  } else {
    res.send("User not found");
  }
});

const jwt = require("jsonwebtoken");

app.post("/verifyUser", async (req, res) => {
  console.log("POST REQUEST", req.body);

  // Check if username or password is empty
  if (req.body.name === "" || req.body.password === "") {
    console.log("Empty username or password");
    res.send({ error: "Please enter both username and password" });
    return;
  }

  const obj = await db.collection("users").findOne({ name: req.body.name });
  if (obj) {
    console.log("User found in database", obj);
    if (obj.password === req.body.password) {
      console.log("Authentication successful");
      // Generate a JWT with the user's information
      const token = jwt.sign({ name: obj.name, password: obj.password }, "secretkey");
      res.send({ token });
    } else {
      console.log("Incorrect password");
      res.send({ error: "Incorrect password" });
    }
  } else {
    console.log("User not found in database");
    res.send({ error: "User not found" });
  }
});

  
app.get("/getUser", async (req, res) => {
  const users = await UserModel.find({});
  res.send(users);
});



app.listen(3001, () => {
  console.log("SERVER RUNS PERFECTLY!");
});
