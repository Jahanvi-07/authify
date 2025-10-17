const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Item = require('./models/Item');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'c3924ceceda8279a1756bf698316ce4205e794cb7027b71bc7bbc38df304e62b0b01ca9641b12ce3fd53567a2451b49d025df91564aae49780b5e064aec17382';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cognifyz_task3';
mongoose
	.connect(mongoUri)
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => {
		console.error('Mongo connection error:', err.message);
		process.exit(1);
	});

// Auth helpers
function generateToken(user) {
	return jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
	const authHeader = req.headers['authorization'] || '';
	const token = authHeader.startsWith('Bearer ')
		? authHeader.slice('Bearer '.length)
		: null;
	if (!token) return res.status(401).json({ error: 'Missing token' });
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = { id: payload.userId, username: payload.username };
		return next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
	const { username, password } = req.body || {};
	if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
	const existing = await User.findOne({ username });
	if (existing) return res.status(409).json({ error: 'username already taken' });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await User.create({ username, passwordHash });
	const token = generateToken(user);
	return res.status(201).json({ token, user: { id: user._id, username: user.username } });
});

app.post('/api/auth/login', async (req, res) => {
	const { username, password } = req.body || {};
	if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
	const user = await User.findOne({ username });
	if (!user) return res.status(401).json({ error: 'invalid credentials' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ error: 'invalid credentials' });
	const token = generateToken(user);
	return res.json({ token, user: { id: user._id, username: user.username } });
});

// Items CRUD (secured)
app.post('/api/items', authenticate, async (req, res) => {
	console.log('POST /api/items body:', req.body);
	const rawName = (req.body && (req.body.name ?? req.body.title)) ?? '';
	const rawDesc = (req.body && (req.body.description ?? req.body.body)) ?? '';
	const name = typeof rawName === 'string' ? rawName.trim() : '';
	const description = typeof rawDesc === 'string' ? rawDesc.trim() : '';
	if (!name) {
		return res.status(400).json({ error: 'name is required' });
	}
	const item = await Item.create({ userId: req.user.id, name, description });
	return res.status(201).json(item);
});

app.get('/api/items', authenticate, async (req, res) => {
	const items = await Item.find({ userId: req.user.id }).sort({ createdAt: -1 });
	return res.json(items);
});

app.get('/api/items/:id', authenticate, async (req, res) => {
	const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
	if (!item) return res.status(404).json({ error: 'Item not found' });
	return res.json(item);
});

app.put('/api/items/:id', authenticate, async (req, res) => {
	const rawName = (req.body && (req.body.name ?? req.body.title)) ?? '';
	const rawDesc = (req.body && (req.body.description ?? req.body.body)) ?? '';
	const name = typeof rawName === 'string' ? rawName.trim() : '';
	const description = typeof rawDesc === 'string' ? rawDesc.trim() : '';
	if (!name) return res.status(400).json({ error: 'name is required' });
	const item = await Item.findOneAndUpdate(
		{ _id: req.params.id, userId: req.user.id },
		{ $set: { name, description } },
		{ new: true }
	);
	if (!item) return res.status(404).json({ error: 'Item not found' });
	return res.json(item);
});

app.delete('/api/items/:id', authenticate, async (req, res) => {
	const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
	if (!item) return res.status(404).json({ error: 'Item not found' });
	return res.json(item);
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});


