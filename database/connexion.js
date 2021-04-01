const MongoClient = require('mongodb').MongoClient;
const movieConstraints = require('./movieConstraints');
const userConstraints = require('./userConstraints');

const url = 'mongodb://localhost:27017';
const dbName = 'p_movies';

const getDb = async () => {
    let db;
    try {
        const client = await MongoClient.connect(url, { useUnifiedTopology: true });
        db = client.db(dbName);
        await movieConstraints(db);
        await userConstraints(db);
    } catch (e) {
        console.error(e);
    }

    return db;
};

module.exports = getDb;