const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const memeVideoRoutes = require('./routes/memeVideos');
const userRoutes = require('./routes/users');
const auth = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); // Add this
require('dotenv').config();

const app = express();
connectDB();

app.use(cors()); // Add this to allow all origins (for dev)
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/memes', memeVideoRoutes);
app.use('/api/users', userRoutes);

app.get('/api/protected', auth, (req, res) => {
    res.json({ msg: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));