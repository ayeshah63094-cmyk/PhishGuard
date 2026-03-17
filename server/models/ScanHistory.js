const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Message', 'URL', 'Email'], required: true },
  inputData: { type: String, required: true },
  status: { type: String, required: true },
  score: { type: Number, required: true },
  explanation: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }, 
  flaggedWords: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
