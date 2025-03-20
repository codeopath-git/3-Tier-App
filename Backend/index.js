require('dotenv').config(); // ✅ Load environment variables

const express = require('express');
const cors = require('cors');
const sendEmail = require('./src/sendEmail');
const confirmResetEmail = require('./src/confirmResetEmail');
const db = require('./src/Database/mongodb');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./src/middleware/authTokenMiddleware');

console.log("✅ ENV - MongoDB URI:", process.env.MONGODB_URI);
console.log("✅ ENV - Database Name:", process.env.DB_NAME);

const port = 4000;
const saltRounds = 10;

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Ensure JSON is parsed properly

// 🔹 API Health Check
app.get('/', (req, res) => {
    res.json({ message: "Backend API is running!" });
});

// 🔹 Secure Route Example
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({ verified: true });
});

// 🔹 LOGIN Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password required" });
    }

    try {
        const user = await getUser(email);
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign({ id: user._id, email }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
                return res.json({ authToken: token });
            } else {
                return res.status(401).json({ message: "Invalid password" });
            }
        }
        return res.status(404).json({ message: "User not found" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 🔹 SIGNUP Endpoint
app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password required" });
    }

    try {
        const exists = await userExist(email);
        if (exists) {
            return res.status(409).json({ message: 'User Already Exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await createUser(email, hashedPassword, firstName, lastName, phone);
        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// 🔹 Database Helper Functions
const getUser = async (email) => {
    const dbConn = await db.Connect();
    return await dbConn.findOne({ email });
};

const userExist = async (email) => {
    const dbConn = await db.Connect();
    return await dbConn.findOne({ email }) !== null;
};

const createUser = async (email, password, firstName, lastName, phone) => {
    const dbConn = await db.Connect();
    return await dbConn.insertOne({ email, password, firstName, lastName, phone, isActive: true, createdAt: new Date() });
};

app.listen(port, () => {
    console.log(`✅ Server running on port ${port}`);
});
