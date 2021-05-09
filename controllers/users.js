const { Db, ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const passport = require('passport');
// Permet de ne jamais avoir le même mot de passe
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { userSchema, signature } = require('./validator');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const userCollection = db.collection('users');

    app.post('/login', async (req, res) => {
        passport.authenticate('local', { session: false }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user,
                });
            }
            req.login(user, { session: false }, (err) => {
                if (err) {
                    return res.send(err);
                }
                delete user.password;

                const token = jwt.sign(user, signature);

                return res.json({ user, token });

            });
        })(req, res);

    });

    // Lister les utilisateurs
    app.get('/api/users', async (req, res) => {
        const users = await userCollection.find().toArray();

        res.json(users);
    });

    // Lister un utilisateur
    app.get('/api/users/:userId', async (req, res) => {
        const { userId } = req.params;
        const _id = new ObjectID(userId);

        const user = await userCollection.findOne({ _id });
        if (user == null) {
            return res.status(404).json({ error: 'Impossible to find this user !' });
        };

        res.json(user);
    });

    // Ajouter un utilisateur
    app.post('/api/users', async (req, res) => {
        const data = req.body;
        try {
            const { error } = userSchema.validate(req.body);

            if (error != null) {
                const firstError = error.details[0];
                return res.status(404).json({ error: firstError.message });
            }
            data.password = bcrypt.hashSync(data.password, saltRounds);

            const response = await userCollection.insertOne(data);

            if (response.result.n !== 1 || response.result.ok !== 1) {
                return res.status(400).json({ error: 'Impossible to create the user !' });
            };
            delete data.password;

            res.json(response.ops[0]);
        } catch (e) {
            console.error(e);
            return res.status(404).json({ error: 'Impossible to create the user !' });
        }
    });

    // Mettre à jour un utilisateur
    app.post('/api/users/:userId', async (req, res) => {
        const { userId } = req.params;
        const data = req.body;
        const _id = new ObjectID(userId);
        
        const { error } = userSchema.validate(req.body);
        
        if (error != null) {
            const firstError = error.details[0];
            return res.status(404).json({ error: firstError.message });
        }
        data.password = bcrypt.hashSync(data.password, saltRounds);

        const response = await userCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false },
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the user !' });
        }
        delete response.value.password;

        res.json(response.value);
    });

    // Supprimer un utilisateur
    app.delete('/api/users/:userId', async (req, res) => {
        const { userId } = req.params;
        const _id = new ObjectID(userId);

        const response = await userCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this user !' });
        };

        res.status(204).send();
    });

};