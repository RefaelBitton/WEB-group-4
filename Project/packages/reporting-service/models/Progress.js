import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: String,
    default: 'Beginner',
    trim: true
  },
  achievements: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
