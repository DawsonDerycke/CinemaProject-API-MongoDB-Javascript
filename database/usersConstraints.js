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
                required: ['username', 'password'],
                properties: {
                    username: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                    password: { 
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                },
            },
        }
    })
}