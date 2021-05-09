const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const passport = require('passport');
const dbConnexion = require("./database/connexion");
const { myPassportLocal, myPassportJWT } = require('./passport');

app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
    app.use('^/api', passport.authenticate('jwt', { session: false }));

    const db = await dbConnexion();

    // Passport
    myPassportLocal(db);
    myPassportJWT();

    // Controllers
    const customers = require('./controllers/customers');
    const movies = require('./controllers/movies');
    const categories = require('./controllers/categories');
    const users = require('./controllers/users');

    // Controllers
    customers(app, db);
    movies(app, db);
    categories(app, db);
    users(app, db);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    });

    app.listen(port, () => {
        console.log(`Movies app listening at http://localhost:${port}`)
    });
})();