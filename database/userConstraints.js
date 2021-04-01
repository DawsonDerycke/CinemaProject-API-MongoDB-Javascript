module.exports = async (db) => {
    const collectionName = 'users';
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    };

    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['firstName', 'year', 'seat', 'ticket'],
                properties: {
                    firstName: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                    year: {
                        bsonType: 'int',
                        minimum: 1,
                        maximum: 120,
                        description: 'must be an integer in [ 1, 120 ] and is required'
                    },
                    seat: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                    ticket: {
                        bsonType: 'bool',
                        description: 'must be a bool and is required'
                    },
                },
            },
        }
    })
}