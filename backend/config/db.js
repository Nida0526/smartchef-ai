const mongoose = require('mongoose');

let isConnected = false; // track the connection status

const connectDB = async () => {
    if (isConnected) {
        console.log('=> using existing database connection');
        return Promise.resolve();
    }

    try {
        console.log('=> using new database connection');
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState;
        console.log(`MongoDB Connected: ${db.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        throw error; // Rethrow to let the caller handle it
    }
};

module.exports = connectDB;
