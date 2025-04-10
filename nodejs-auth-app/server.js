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

mongoose.connect('mongodb://localhost:27017/memesforyou', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true },
  bio: String,
  profilePic: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  folders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});
const User = mongoose.model('User', userSchema);

// Folder Schema
const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }, // Nested folders
});
const Folder = mongoose.model('Folder', folderSchema);

// Video Schema
const videoSchema = new mongoose.Schema({
  movieName: { type: String, required: true },
  filePath: { type: String, required: true },
  thumbnail: String,
  tags: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ text: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
});
const Video = mongoose.model('Video', videoSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, username });
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

app.post('/api/auth/logout', (req, res) => res.json({ msg: 'Logged out' }));

app.get('/api/users/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('videos')
      .populate({ path: 'folders', populate: { path: 'videos' } })
      .populate('followers', 'username')
      .populate('following', 'username');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/users/me', auth, async (req, res) => {
  const { username, bio, profilePic } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio, profilePic },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/folders', auth, async (req, res) => {
  const { name, parentFolderId } = req.body;
  try {
    const folder = new Folder({ name, userId: req.user.id, parentFolderId: parentFolderId || null });
    await folder.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { folders: folder._id } });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/folders/:id', auth, async (req, res) => {
  const { name } = req.body;
  try {
    const folder = await Folder.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.delete('/api/folders/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (folder.userId.toString() !== req.user.id) return res.status(403).json({ msg: 'Unauthorized' });
    await Folder.deleteOne({ _id: req.params.id });
    await User.findByIdAndUpdate(req.user.id, { $pull: { folders: req.params.id } });
    res.json({ msg: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/memes/upload', auth, upload.single('video'), async (req, res) => {
  const { movieName, tags, folderId, isPublic } = req.body;
  try {
    const video = new Video({
      movieName,
      filePath: `uploads/${req.file.filename}`,
      tags: tags.split(','),
      userId: req.user.id,
      folderId: folderId || null,
      isPublic: isPublic === 'true',
    });
    await video.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { videos: video._id } });
    if (folderId) await Folder.findByIdAndUpdate(folderId, { $push: { videos: video._id } });
    res.json({ msg: 'Video uploaded', video });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/memes/search', auth, async (req, res) => {
  const { movieName, tags, sortBy } = req.query;
  try {
    const query = { userId: req.user.id };
    if (movieName) query.movieName = new RegExp(movieName, 'i');
    if (tags) query.tags = { $in: tags.split(',') };

    const folders = await Folder.find({ name: new RegExp(movieName || '', 'i'), userId: req.user.id }).populate('videos');
    let videos = await Video.find(query).populate('userId', 'username');
    if (sortBy === 'likes') videos = videos.sort((a, b) => b.likes.length - a.likes.length);
    if (sortBy === 'views') videos = videos.sort((a, b) => b.views - a.views);

    res.json({ folders, videos });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/memes/download/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video || (video.userId.toString() !== req.user.id && !video.isPublic)) {
      return res.status(404).json({ msg: 'Video not found' });
    }
    video.views += 1;
    await video.save();
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

app.post('/api/users/:id/follow', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } });
    res.json({ msg: 'Followed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));