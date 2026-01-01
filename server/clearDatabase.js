const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars from server directory
dotenv.config();

const clearDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Delete all documents from each collection
        for (let collection of collections) {
            const count = await collection.countDocuments();
            await collection.deleteMany({});
            console.log(`✅ Cleared ${count} documents from ${collection.collectionName}`);
        }

        console.log('\n🎉 Database cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

clearDatabase();
