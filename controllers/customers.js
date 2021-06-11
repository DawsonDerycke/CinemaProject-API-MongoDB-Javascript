const { Db, ObjectID } = require('mongodb');
const { customerSchema } = require('./validator');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const customerCollection = db.collection('customers');

    // Lister les clients
    app.get('/api/customers', async (req, res) => {
        const customers = await customerCollection.find().toArray();

        res.json(customers);
    });

    // Lister un client
    app.get('/api/customers/:customerId', async (req, res) => {
        const { customerId } = req.params;
        const _id = new ObjectID(customerId);

        const customer = await customerCollection.findOne({ _id });
        if (customer == null) {
            return res.status(404).json({ error: 'Impossible to find this customer !' });
        };

        res.json(customer);
    });

    // Ajouter un client
    app.post('/api/customers/', async (req, res) => {
        const data = req.body;
        try {
            const { error } = customerSchema.validate(req.body);

            if (error != null) {
                const firstError = error.details[0];
                return res.status(404).json({ error: firstError.message });
            }
            data.ticket = data.ticket === 'true';
            data.year = parseInt(data.year);

            const response = await customerCollection.insertOne(data);

            if (response.result.n !== 1 || response.result.ok !== 1) {
                return res.status(400).json({ error: 'Impossible to create the customer !' });
            };

            res.json(response.ops[0]);
        } catch (e) {
            console.error(e);
            return res.status(404).json({ error: 'Impossible to create the customer !' });
        }
    });

    // Mettre à jour un client
    app.post('/api/customers/:customerId', async (req, res) => {
        const { customerId } = req.params;
        const data = req.body;
        const _id = new ObjectID(customerId);
        console.log(data, 'oto', _id);
        const { error } = customerSchema.validate(req.body);

        if (error != null) {
            const firstError = error.details[0];
            return res.status(404).json({ error: firstError.message });
        }
        data.ticket = data.ticket === 'true';
        data.year = parseInt(data.year);

        const response = await customerCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false },
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the customer !' });
        }

        res.json(response.value);
    });

    // Supprimer un client
    app.delete('/api/customers/:customerId', async (req, res) => {
        const { customerId } = req.params;
        const _id = new ObjectID(customerId);

        const response = await customerCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this customer !' });
        };

        res.status(204).send();
    });

    // Supprimer les tickets utilisés
    app.delete('/api/ticketFalse/customers', async (req, res) => {
        const response = await customerCollection.aggregate([
            { $match: { ticket: false } },
        ]).map(c => {
            return c._id;
        }).toArray();

        if (response.length < 1) {
            return res.status(404).send({ error: 'No false ticket have been found !' });
        };

        await customerCollection.deleteMany({ _id: { $in: response } });
        res.status(204).send();
    });

    // Lister les spectateurs des films
    app.get('/api/movies/customers', async (req, res) => {
        const reponse = await customerCollection.aggregate([
            {
                $lookup: {
                    from: 'movies',
                    localField: 'movie',
                    foreignField: 'title',
                    as: 'movie'
                }
            },
            { $project: { ticket: 0, 'movie.releaseDate': 0, 'movie.customersRatings': 0, } },
        ]).toArray();

        res.json(reponse);
    });

};