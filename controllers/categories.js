const { Db, ObjectID } = require('mongodb');
const { categorySchema } = require('./validator');

module.exports = (app, db) => {
    if (!(db instanceof Db)) {
        throw new Error('Invalid Database');
    };
    const categCollection = db.collection('categories');

    // Lister les catégories
    app.get('/api/categories', async (req, res) => {
        const categories = await categCollection.find().toArray();

        res.json(categories);
    });

    // Lister une catégorie
    app.get('/api/categories/:categoryId', async (req, res) => {
        const { categoryId } = req.params;
        const _id = new ObjectID(categoryId);

        const category = await categCollection.findOne({ _id });
        if (category == null) {
            return res.status(404).json({ error: 'Impossible to find this category !' });
        };

        res.json(category);
    });

    // Ajouter une catégorie
    app.post('/api/categories', async (req, res) => {
        const data = req.body;
        try {
            const { error } = categorySchema.validate(req.body);

            if (error != null) {
                const firstError = error.details[0];
                return res.status(404).json({ error: firstError.message });
            }
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
    app.post('/api/categories/:categoryId', async (req, res) => {
        const { categoryId } = req.params;
        delete req.body._id;

        const data = req.body;
        const _id = new ObjectID(categoryId);
        const { error } = categorySchema.validate(req.body);

        if (error != null) {
            const firstError = error.details[0];
            return res.status(404).json({ error: firstError.message });
        }
        data.duration = parseInt(data.duration);

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
    app.delete('/api/categories/:categoryId', async (req, res) => {
        const { categoryId } = req.params;
        const _id = new ObjectID(categoryId);

        const response = await categCollection.findOneAndDelete({ _id });
        if (response.value == null) {
            return res.status(404).send({ error: 'Impossible to remove this category !' });
        };

        res.status(204).send();
    });

    // Lister les films qui durent moins de 2 heures
    app.get('/api/duration/categories', async (req, res) => {
        const reponse = await categCollection.aggregate([
            { $project: { title: 1, category: 1, duration: 1, director: 1, actor: 1, durations: { $gte: ["$duration", 121] }, } },
            { $match: { durations: false } },
            { $project: { durations: 0 } },
        ]).toArray();

        res.json(reponse);
    });

};