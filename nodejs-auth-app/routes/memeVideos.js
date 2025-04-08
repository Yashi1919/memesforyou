const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Add this line
const auth = require('../middleware/auth');
const MemeVideo = require('../models/MemeVideo');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
        cb(null, true);
    } else {
        cb(new Error('Only MP4 files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}).single('video');

router.post('/upload', auth, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err.message || 'Upload failed: Invalid file or size exceeds 50MB' });
        }
        const { movieName, tags } = req.body;
        if (!movieName || !req.file) {
            return res.status(400).json({ msg: 'Movie name and video file are required' });
        }
        try {
            const memeVideo = new MemeVideo({
                movieName,
                filePath: req.file.path,
                uploadedBy: req.user.id,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            });
            await memeVideo.save();
            res.json({ msg: 'Video uploaded successfully', memeVideo });
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    });
});

router.get('/search', auth, async (req, res) => {
    const { movieName, tag } = req.query;
    if (!movieName && !tag) return res.status(400).json({ msg: 'Movie name or tag is required' });
    try {
        const query = {};
        if (movieName) query.movieName = { $regex: movieName, $options: 'i' };
        if (tag) query.tags = { $in: [new RegExp(tag, 'i')] };
        const videos = await MemeVideo.find(query).populate('uploadedBy', 'email');
        res.json(videos);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.get('/download/:id', auth, async (req, res) => {
    try {
        const video = await MemeVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ msg: 'Video not found' });
        res.download(video.filePath);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/like', auth, async (req, res) => {
    try {
        const video = await MemeVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ msg: 'Video not found' });
        if (video.likes.includes(req.user.id)) {
            video.likes = video.likes.filter(id => id.toString() !== req.user.id);
        } else {
            video.likes.push(req.user.id);
        }
        await video.save();
        res.json({ msg: 'Like updated', likes: video.likes });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/comment', auth, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: 'Comment text is required' });
    try {
        const video = await MemeVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ msg: 'Video not found' });
        const comment = { text, user: req.user.id };
        video.comments.push(comment);
        await video.save();
        res.json({ msg: 'Comment added', comments: video.comments });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;