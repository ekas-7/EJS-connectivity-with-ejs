const express = require("express");
const path = require("path");
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');

const app = express();
const port = 3030;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'DATABASE',
    password: 'PASSWORD',
});

const createRandomUser = () => {
    return [
        faker.datatype.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

app.get("/", (req, res) => {
    const q = "SELECT COUNT(*) AS count FROM user"; 
    connection.query(q, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        const entries = result[0].count;
        res.render("index.ejs", { entries });
    });
});

app.get("/posts", (req, res) => {
    const q = "SELECT * FROM user"; 
    connection.query(q, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        const entries = result; 
        res.render("responses.ejs", { entries });
    });
});

app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const q = `DELETE FROM user WHERE id = '${id}'`; 
    connection.query(q, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect("/posts"); 
    });
});

app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const q = `SELECT * FROM user WHERE id ='${id}'`; 
    connection.query(q, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        const user = result[0]; // Assuming only one user is retrieved
        res.render("edit.ejs", { user }); // Pass the user data to the edit.ejs view
    });
});

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const { username, email, password } = req.body;

    const q = `UPDATE user SET username = '${username}', email = '${email}', password = '${password}' WHERE id = '${id}'`; 
    connection.query(q, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect("/posts"); 
    });
});

app.get("/posts/new", (req, res) => {
    res.render("new.ejs");
});
app.post("/posts/new", (req, res) => {
    const { username, email, password } = req.body;
    const id = faker.datatype.uuid();
    const q = `INSERT INTO user(username, email, password, id) VALUES ('${username}', '${email}', '${password}', '${id}')`; 
    connection.query(q, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect("/posts"); 
    });
});


app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
