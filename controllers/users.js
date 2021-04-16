const { Db, ObjectID } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const userCollection = db.collection('users');

    // Lister les utilisateurs
    app.get('/users', async (req, res) => {
        const users = await userCollection.find().toArray();

        res.json(users);
    });

    // Lister un utilisateur
    app.get('/users/:userId', async (req, res) => {
        const { userId } = req.params;
        const _id = new ObjectID(userId);

        const user = await userCollection.findOne({ _id });
        if (user == null) {
            return res.status(404).json({ error: 'Impossible to find this user !' });
        };

        res.json(user);
    });

    // Ajouter un utilisateur
    app.post('/users', async (req, res) => {
        const data = req.body;
        try {
            data.ticket = data.ticket === 'true';
            data.year = parseInt(data.year);
            const response = await userCollection.insertOne(data);

            if (response.result.n !== 1 || response.result.ok !== 1) {
                return res.status(400).json({ error: 'Impossible to create the user !' });
            };

            res.json(response.ops[0]);
        } catch (e) {
            console.error(e);
            return res.status(404).json({ error: 'Impossible to create the user !' });
        }
    });

    // Mettre à jour un utilisateur
    app.post('/users/:userId', async (req, res) => {
        const { userId } = req.params;
        const data = req.body;
        const _id = new ObjectID(userId);

        const response = await userCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false },
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the user !' });
        }

        res.json(response.value);
    });

    // Supprimer un utilisateur
    app.delete('/users/:userId', async (req, res) => {
        const { userId } = req.params;
        const _id = new ObjectID(userId);

        const response = await userCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this user !' });
        };

        res.status(204).send();
    });

    // Lister les tickets utilisés
    app.get('/ticketFalse/users', async (req, res) => {
        const response = await userCollection.aggregate([
            { $match: { ticket: false } },
        ]).toArray();

        // Supprimer les utilisateurs qui correspondent à la recherche

        res.json(response);

    });

};