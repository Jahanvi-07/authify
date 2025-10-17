const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		name: { type: String, required: true },
		description: { type: String, default: '' }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);


