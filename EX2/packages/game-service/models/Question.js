import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
  gameId: { type: String, required: true, index: true },
  text: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  options: { type: [OptionSchema], default: [] },
  correctOptionId: { type: String, required: true },
  points: { type: Number, default: 10 },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
