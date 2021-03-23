const express = require('express');
const app = express();
const port = 3000;
const dbConnexion = require("./database/connexion");

(async () => {
    const db = await dbConnexion();
    
    app.get('/', (req, res) => {
        res.send('Hello World!')
    });
    
    app.listen(port, () => {
        console.log(`Movies app listening at http://localhost:${port}`)
    });
})();