const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const dbConnexion = require("./database/connexion");

app.use(bodyParser.urlencoded({ extended: true }));

const users = require('./controllers/users');
const movies = require('./controllers/movies');


(async () => {
    const db = await dbConnexion();

    // Controllers
    users(app, db);
    movies(app, db);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    });

    app.listen(port, () => {
        console.log(`Movies app listening at http://localhost:${port}`)
    });
})();