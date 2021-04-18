module.exports = async (db) => {
    const collectionName = 'categories';
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    };

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['category', 'duration', 'director', 'actor'],
                properties: {
                    category: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                    duration: {
                        bsonType: 'int',
                        minimum: 5,
                        maximum: 600,
                        description: 'must be an integer in [ 5, 600 ] and is required'
                    },
                    director: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                    actor: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                },
            },
        }
    })
}