import mysql from "mysql";

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "cointab",
});

async function fetchDbUsers() {
  return new Promise((resolve, reject) => {
    connection.query(`select id from user`, (err, res, fields) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const ids = JSON.parse(JSON.stringify(res));
        var dbusers = ids.map((id) => {
          return id.id;
        });
        resolve(dbusers);
      }
    });
  });
}

async function addUser(user) {
  return new Promise((resolve, reject) => {
    connection.query(
      `insert into user (id, name, email, city, phone, website, company) values (${user.id}, '${user.name}', '${user.email}', '${user.city}', '${user.phone}', '${user.website}', '${user.company}')`,
      (err, res, fields) => {
        if (err) {
          console.log(err);
          reject({ message: err });
        } else {
          resolve({ message: "User added to db" ,success:true});
        }
      }
    );
  });
}

async function checkDbPosts(id) {
  return new Promise((resolve, reject) => {
    connection.query(`select count(id) as count from posts where id=${id}`, (err, res, fields) => {
      if (err) {
        console.log(err);
        reject(false);
      } else {
      const ids = JSON.parse(JSON.stringify(res));
        // var dbposts = ids.map((id) => {
        //   return id.id;
        // });
        if(ids[0].count==0){
          resolve(false);
        }
        resolve(true);
      }
    });
  });
}

async function fetchUserNameAndCompany(id) {
  return new Promise((resolve, reject) => {
    connection.query(`select name,company from user where id=${id}`, (err, res, fields) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const data = JSON.parse(JSON.stringify(res));
        resolve(data[0]);
      }
    });
  });

}

async function addPosts(posts) {
  return new Promise((resolve, reject) => {
    try{
    posts.forEach(post => {
      connection.query(
        `insert into posts (id, title, body,name,company) values (${post.id}, '${post.title}', '${post.body}', '${post.name}', '${post.company}')`,
        (err, res, fields) => {
          if (err) {
            console.log(err);
            reject({ message: err });
          }
        }
      );
    });
    resolve({ message: "Posts added to db" ,success:true});
  }
  catch(err){
    reject({ message: err });
  }
  });
}

export { fetchDbUsers,addUser,checkDbPosts,fetchUserNameAndCompany,addPosts };
