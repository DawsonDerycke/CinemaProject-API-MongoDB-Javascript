const { Db, ObjectID, Double } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const movieCollection = db.collection('movies');

    // Lister les films
    app.get('/movies', async (req, res) => {
        const movies = await movieCollection.find().toArray();

        res.json(movies);
    });

    // Lister un film
    app.get('/movies/:movieId', async (req, res) => {
        const { movieId } = req.params;
        const _id = new ObjectID(movieId);

        const movie = await movieCollection.findOne({ _id });
        if (movie == null) {
            return res.status(404).json({ error: 'Impossible to find this movie !' });
        };

        res.json(movie);
    });

    // Ajouter un film
    app.post('/movies', async (req, res) => {
        const data = req.body;
        try {
            data.price = Double(data.price);
            data.releaseDate = new Date(data.releaseDate);
            data.note = Double(data.notesClients);
            console.log(data.note);
            const response = await movieCollection.insertOne(data);

            if (response.result.n !== 1 || response.result.ok !== 1) {
                return res.status(400).json({ error: 'Impossible to create the movie !' });
            };

            res.json(response.ops[0]);
        } catch (e) {
            console.error(e);
            return res.status(404).json({ error: 'Impossible to create the user !' });
        }
    });

    // Mettre à jour un film
    app.post('/movies/:movieId', async (req, res) => {
        const { movieId } = req.params;
        const data = req.body;
        const _id = new ObjectID(movieId);

        const response = await movieCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false },
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the movie !' });
        }

        res.json(response.value);
    });

    // Supprimer un film
    app.delete('/movies/:movieId', async (req, res) => {
        const { movieId } = req.params;
        const _id = new ObjectID(movieId);

        const response = await movieCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this movie !' });
        };

        res.status(204).send();
    });

    // Lister les films qui sont sortie ?? releaseDate = now() ?
    app.get('/releasedNow/movies', async (req, res) => {
        const reponse = await movieCollection.aggregate([

        ]).toArray();

        res.json(reponse);
    });

    // Lister les notes d'un film
    app.get('/movies/:movieId/notesClients', async (req, res) => {
        const { movieId } = req.params;

        const notesClients = await movieCollection.aggregate([
            { $match: { _id: new ObjectID(movieId) } },
            { $unwind: '$notesClients' },
            { $replaceRoot: { newRoot: '$notesClients' } },

        ]).toArray();

        res.json(notesClients);
    });

    // Ajouter une note
    app.post('/movies/:movieId/notesClients', async (req, res) => {
        const { movieId } = req.params;
        const { note } = req.body;
        const _id = new ObjectID(movieId);

        const { value } = await movieCollection.findOneAndUpdate(
            { _id },
            {
                $push: {
                    notesClients: {
                        note,
                        _id: new ObjectID()
                    }
                }
            },
            { returnOriginal: false },
        );

        res.json(value);
    });

    // Supprimer une note
    app.delete('/movies/:movieId/notesClients/:noteId', async (req, res) => {
        const { movieId, noteId } = req.params;
        const _id = new ObjectID(movieId);
        const _noteId = new ObjectID(noteId);

        const { value } = await movieCollection.findOneAndUpdate(
            { _id },
            {
                $pull: {
                    notesClients: { _id: _noteId }
                }
            },
            { returnOriginal: false },
        );

        res.json(value);
    });

    // Modifier une note
    app.post('/movies/:movieId/notesClients/:noteId', async (req, res) => {
        const { movieId, noteId } = req.params;
        const { note } = req.body;
        const _id = new ObjectID(movieId);
        const _noteId = new ObjectID(noteId);

        const { value } = await movieCollection.findOneAndUpdate(
            {
                _id,
                'notesClients._id': _noteId
            },
            {
                $set: {
                    'notesClients.$.note': note,
                },
            },
            { returnOriginal: false },
        );

        res.json(value);
    });

};