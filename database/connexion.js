const MongoClient = require('mongodb').MongoClient;
const movieConstraints = require('./movieConstraints');
const customerConstraints = require('./customerConstraints');
const categoryConstraints = require('./categoryConstraints');
const userConstraints = require('./userConstraints');

const url = 'https://projet-mongodb.herokuapp.com/';
const dbName = 'p_movies';

const getDb = async () => {
    let db;
    try {
        const client = await MongoClient.connect(url, { useUnifiedTopology: true });
        db = client.db(dbName);
        await movieConstraints(db);
        await customerConstraints(db);
        await categoryConstraints(db);
        await userConstraints(db);
    } catch (e) {
        console.error(e);
    }

    return db;
};

module.exports = getDb;