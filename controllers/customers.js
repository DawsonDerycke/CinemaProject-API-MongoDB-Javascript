const { Db, ObjectID } = require('mongodb');

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
    app.post('/api/customers', async (req, res) => {
        const data = req.body;
        try {
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

    // Lister les tickets utilisés
    app.get('/api/ticketFalse/customers', async (req, res) => {
        const response = await customerCollection.aggregate([
            { $match: { ticket: false } },
        ]).toArray();

        // Supprimer les clients qui correspondent à la recherche

        res.json(response);

    });

};