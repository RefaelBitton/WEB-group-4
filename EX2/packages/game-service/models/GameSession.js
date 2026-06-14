import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  gameId: { type: String, required: true },
  selectedOptionId: { type: String },
  correct: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);
