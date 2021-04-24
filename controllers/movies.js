const { Db, ObjectID, Double } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const movieCollection = db.collection('movies');

    // Lister les films
    app.get('/api/movies', async (req, res) => {
        const movies = await movieCollection.find().toArray();

        res.json(movies);
    });

    // Lister un film
    app.get('/api/movies/:movieId', async (req, res) => {
        const { movieId } = req.params;
        const _id = new ObjectID(movieId);

        const movie = await movieCollection.findOne({ _id });
        if (movie == null) {
            return res.status(404).json({ error: 'Impossible to find this movie !' });
        };

        res.json(movie);
    });

    // Ajouter un film
    app.post('/api/movies', async (req, res) => {
        const data = req.body;
        try {
            if (data.customersRatings) {
                data.customersRatings = data.customersRatings.map(c => {
                    c.rating = Double(c.rating);
                    return c;
                });
            }
            data.price = Double(data.price);
            data.releaseDate = new Date(data.releaseDate);

            const response = await movieCollection.insertOne(data);

            if (response.result.n !== 1 || response.result.ok !== 1) {
                return res.status(400).json({ error: 'Impossible to create the movie !' });
            };

            res.json(response.ops[0]);
        } catch (e) {
            console.error(e);
            return res.status(404).json({ error: 'Impossible to create the movie !' });
        }
    });

    // Mettre à jour un film
    app.post('/api/movies/:movieId', async (req, res) => {
        const { movieId } = req.params;
        const data = req.body;
        const _id = new ObjectID(movieId);
        if (data.customersRatings) {
            data.customersRatings = data.customersRatings.map(c => {
                c.rating = Double(c.rating);
                return c;
            });
        }
        data.price = Double(data.price);
        data.releaseDate = new Date(data.releaseDate);

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
    app.delete('/api/movies/:movieId', async (req, res) => {
        const { movieId } = req.params;
        const _id = new ObjectID(movieId);

        const response = await movieCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this movie !' });
        };

        res.status(204).send();
    });

    // Lister les films qui sont sortie ?? releaseDate = now() ?
    app.get('/api/releasedNow/movies', async (req, res) => {
        const reponse = await movieCollection.aggregate([

        ]).toArray();

        res.json(reponse);
    });

    // Lister les notes d'un film
    app.get('/api/movies/:movieId/customersRatings', async (req, res) => {
        const { movieId } = req.params;

        const customersRatings = await movieCollection.aggregate([
            { $match: { _id: new ObjectID(movieId) } },
            { $unwind: '$customersRatings' },
            { $replaceRoot: { newRoot: '$customersRatings' } },

        ]).toArray();

        res.json(customersRatings);
    });

    /* à refaire
    // Ajouter une note
    app.post('/api/movies/:movieId/customersRatings', async (req, res) => {
        const { movieId } = req.params;
        const { rating } = req.body;
        const _id = new ObjectID(movieId);

        const { value } = await movieCollection.findOneAndUpdate(
            { _id },
            {
                $push: {
                    customersRatings: {
                        rating,
                        _id: new ObjectID()
                    }
                }
            },
            { returnOriginal: false },
        );

        res.json(value);
    });

    // Supprimer une note
    app.delete('/api/movies/:movieId/customersRatings/:ratingId', async (req, res) => {
        const { movieId, ratingId } = req.params;
        const _id = new ObjectID(movieId);
        const _ratingId = new ObjectID(ratingId);

        const { value } = await movieCollection.findOneAndUpdate(
            { _id },
            {
                $pull: {
                    customersRatings: { _id: _ratingId }
                }
            },
            { returnOriginal: false },
        );

        res.json(value);
    });

    // Modifier une note
    app.post('/api/movies/:movieId/customersRatings/:ratingId', async (req, res) => {
        const { movieId, ratingId } = req.params;
        const { rating } = req.body;
        const _id = new ObjectID(movieId);
        const _ratingId = new ObjectID(ratingId);

        const { value } = await movieCollection.findOneAndUpdate(
            {
                _id,
                'customersRatings._id': _ratingId
            },
            {
                $set: {
                    'customersRatings.$.rating': rating,
                },
            },
            { returnOriginal: false },
        );

        res.json(value);
    });*/

};