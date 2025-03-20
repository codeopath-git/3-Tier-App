const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const User = require('../models/userModel');
require('dotenv').config();

// ✅ Correct environment variables
const url = process.env.MONGODB_URI; // Previously: mongoDBConnection
const dbName = process.env.DB_NAME;  // Previously: dbName

// ✅ Keep a single MongoDB client to prevent reconnecting on every request
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function dbConnect() {
    try {
        // ✅ Check if already connected before reconnecting
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
            console.log('✅ Connected to MongoDB');
        }
        return client.db(dbName).collection('users'); // ✅ Ensure correct collection name
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
    }
}

async function createNewUser(data) {
    try {
        console.log('Creating user:', data);
        const newUser = new User({
            _id: mongoose.Types.ObjectId(),
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            isActive: true,
        });
        return await newUser.save();  // ✅ Wait for user to be saved properly
    } catch (error) {
        console.error('❌ Error Creating User:', error.message);
    }
}

// ❌ Removed dbDisconnect() - connection should stay open
// async function dbDisconnect() {
//     try {
//         await client.close();
//         console.log('🔌 Database Disconnected');
//     } catch (error) {
//         console.error('❌ Error Closing DB:', error.message);
//     }
// }

module.exports = { dbConnect, createNewUser };
