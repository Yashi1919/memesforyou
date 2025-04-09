const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/memesforyou', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
});
const User = mongoose.model('User', userSchema);

// Folder Schema
const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
});
const Folder = mongoose.model('Folder', folderSchema);

// Video Schema
const videoSchema = new mongoose.Schema({
  movieName: { type: String, required: true },
  filePath: { type: String, required: true },
  tags: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }, // Optional folder
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ text: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
});
const Video = mongoose.model('Video', videoSchema);

// Middleware to verify token
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Multer setup for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ user: { id: user.id } }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ msg: 'User already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const token = jwt.sign({ user: { id: user.id } }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ msg: 'Logged out' }); // Token invalidated client-side
});

app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('videos').populate('folders');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a folder
app.post('/api/folders', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const folder = new Folder({ name, userId: req.user.id });
    await folder.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { folders: folder._id } });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload video to a folder
app.post('/api/memes/upload', auth, upload.single('video'), async (req, res) => {
  const { movieName, tags, folderId } = req.body;
  try {
    const video = new Video({
      movieName,
      filePath: `uploads/${req.file.filename}`,
      tags: tags.split(','),
      userId: req.user.id,
      folderId: folderId || null,
    });
    await video.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { videos: video._id } });
    if (folderId) {
      await Folder.findByIdAndUpdate(folderId, { $push: { videos: video._id } });
    }
    res.json({ msg: 'Video uploaded' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Search videos or folders
app.get('/api/memes/search', auth, async (req, res) => {
  const { movieName } = req.query;
  try {
    const folders = await Folder.find({ name: new RegExp(movieName, 'i'), userId: req.user.id }).populate('videos');
    const videos = await Video.find({
      movieName: new RegExp(movieName, 'i'),
      userId: req.user.id,
      folderId: null, // Videos not in folders
    });
    res.json({ folders, videos });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/memes/download/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || video.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    res.download(video.filePath);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/memes/:id/like', auth, async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.id } });
    res.json({ msg: 'Liked' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/memes/:id/comment', auth, async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $push: { comments: { text: req.body.text, userId: req.user.id } },
    });
    res.json({ msg: 'Commented' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));