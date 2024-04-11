import fetch from "node-fetch";
import express from "express";
import mysql from "mysql";
import json2xls from "json2xls";
import { fetchDbUsers,addUser,checkDbPosts,fetchUserNameAndCompany,addPosts } from "./utils/helper.js";
const app = express();

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "cointab",
});

app.get("/", async (req, res) => {
  try {
    var dbusers = await fetchDbUsers();
    
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();
    const users = data.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.address.city,
        phone: user.phone,
        website: user.website,
        company: user.company.name,
        isDbUser: dbusers.includes(user.id),
      };
    });
    res.render("index", { users: users });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${id}`
    );
    const {name,company} = await fetchUserNameAndCompany(id);
    const data = await response.json();
    var dbposts = await checkDbPosts(id);
    res.render("posts", { posts: data ,isDbPost:dbposts,name,company,id});
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("No data found");
  }
});

app.post("/adduser", async(req, res) => {
    const user = req.body;
    const responseMsg = await addUser(user);
    res.json(responseMsg);
});

app.post("/bulkadd",async(req,res)=>{
  const id = req.body.id;
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${id}`
  );
  const {name,company} = await fetchUserNameAndCompany(id);
  var posts = await response.json();
  posts = posts.map((post)=>{
    return {
      id,
      name,
      title:post.title,
      body:post.body,
      company
    }
  });
  const responseMsg = await addPosts(posts);
  res.json(responseMsg);
});

app.get("/download/:id", async (req, res) => {
  const id = req.params.id;
  connection.query(`select * from posts where id=${id}`, (err, data, fields) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching data");
    } else {
      //send excel file
      const xls = json2xls(data);
      res.setHeader("Content-Type", "application/vnd.openxmlformats");
      res.setHeader("Content-Disposition", "attachment; filename=posts.xlsx");
      res.end(xls, "binary");
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
