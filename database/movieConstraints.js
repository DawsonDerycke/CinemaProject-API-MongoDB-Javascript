module.exports = async (db) => {
    const collectionName = 'movies';
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.some(c => c.name === collectionName)) {
        return;
    }; 
 
    await db.createCollection(collectionName, {
        validator: {
            $jsonSchema: { 
                bsonType: 'object',
                required: ['title', 'price', 'yearRequired', 'releaseDate'],
                properties: {
                    title: {
                        bsonType: 'string',
                        description: 'must be a string and is required'
                    },
                    price: { 
                        bsonType: 'double', 
                        description: 'must be a double and is required'
                    },
                    yearRequired: {
                        enum: ["0", "3", "7", "12", "18"],
                        description: "can only be one of the enum values and is required"
                    },
                    releaseDate: {
                        bsonType: 'date',
                        description: 'must be a date and is required'
                    },
                },
            },
        }
    })
}