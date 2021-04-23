const MongoClient = require('mongodb').MongoClient;
const movieConstraints = require('./movieConstraints');
const customerConstraints = require('./customerConstraints');
const categoryConstraints = require('./categoryConstraints');
const usersConstraints = require('./usersConstraints');

const url = 'mongodb://localhost:27017';
const dbName = 'p_movies';

const getDb = async () => {
    let db;
    try {
        const client = await MongoClient.connect(url, { useUnifiedTopology: true });
        db = client.db(dbName);
        await movieConstraints(db);
        await customerConstraints(db);
        await categoryConstraints(db);
        await usersConstraints(db);
    } catch (e) {
        console.error(e);
    }

    return db;
};

module.exports = getDb;