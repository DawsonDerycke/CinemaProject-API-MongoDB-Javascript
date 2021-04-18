const { Db, ObjectID } = require('mongodb');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const categCollection = db.collection('categories');

    // Lister les catégories
    app.get('/categories', async (req, res) => {
        const categories = await categCollection.find().toArray();

        res.json(categories);
    });

    // Lister une catégorie
    app.get('/categories/:categoryId', async (req, res) => {
        const { categoryId } = req.params;
        const _id = new ObjectID(categoryId);

        const category = await categCollection.findOne({ _id });
        if (category == null) {
            return res.status(404).json({ error: 'Impossible to find this category !' });
        };

        res.json(category);
    });

    // Ajouter une catégorie
    app.post('/categories', async (req, res) => {
        const data = req.body; 
        try {
            data.duration = parseInt(data.duration);

            const response = await categCollection.insertOne(data);

            if (response.result.n !== 1 || response.result.ok !== 1) {
                return res.status(400).json({ error: 'Impossible to create the category !' });
            };

            res.json(response.ops[0]);
        } catch (e) {
            console.error(e);
            return res.status(404).json({ error: 'Impossible to create the category !' });
        }
    });

    // Mettre à jour une catégorie
    app.post('/categories/:categoryId', async (req, res) => {
        const { categoryId } = req.params;
        const data = req.body;
        const _id = new ObjectID(categoryId);

        const response = await categCollection.findOneAndUpdate(
            { _id },
            { $set: data },
            { returnOriginal: false },
        );
        if (response.ok !== 1) {
            return res.status(400).json({ error: 'Impossible to update the category !' });
        }

        res.json(response.value);
    });

    // Supprimer une catégorie
    app.delete('/categories/:categoryId', async (req, res) => {
        const { categoryId } = req.params;
        const _id = new ObjectID(categoryId);

        const response = await categCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this category !' });
        };

        res.status(204).send();
    });

};