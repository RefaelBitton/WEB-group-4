import { GameType } from "../models/GameType.js";

export const gameTypes = [
  {
    id: "image-recognition",
    name: "משחק זיהוי תמונות",
    description: "בחירת המילה באנגלית שמתארת את התמונה.",
    questions: [
      {
        id: "img-cat-1",
        text: "",
        imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
        points: 10,
        options: [
          { id: "cat", text: "Cat", isCorrect: true },
          { id: "dog", text: "Dog", isCorrect: false },
          { id: "fish", text: "Fish", isCorrect: false },
          { id: "bird", text: "Bird", isCorrect: false },
        ],
      },
      {
        id: "img-apple-1",
        text: "",
        imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
        points: 10,
        options: [
          { id: "banana", text: "Banana", isCorrect: false },
          { id: "apple", text: "Apple", isCorrect: true },
          { id: "orange", text: "Orange", isCorrect: false },
          { id: "grape", text: "Grape", isCorrect: false },
        ],
      },
      {
        id: "img-dog-1",
        text: "",
        imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
        points: 10,
        options: [
          { id: "dog", text: "Dog", isCorrect: true },
          { id: "cat", text: "Cat", isCorrect: false },
          { id: "rabbit", text: "Rabbit", isCorrect: false },
          { id: "bird", text: "Bird", isCorrect: false },
        ],
      },
      {
        id: "img-elephant-1",
        text: "",
        imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80",
        points: 10,
        options: [
          { id: "tiger", text: "Tiger", isCorrect: false },
          { id: "monkey", text: "Monkey", isCorrect: false },
          { id: "elephant", text: "Elephant", isCorrect: true },
          { id: "lion", text: "Lion", isCorrect: false },
        ],
      },
      {
        id: "img-car-1",
        text: "",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        points: 10,
        options: [
          { id: "car", text: "Car", isCorrect: true },
          { id: "bike", text: "Bike", isCorrect: false },
          { id: "plane", text: "Plane", isCorrect: false },
          { id: "train", text: "Train", isCorrect: false },
        ],
      },
      {
        id: "img-sun-1",
        text: "",
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        points: 10,
        options: [
          { id: "rain", text: "Rain", isCorrect: false },
          { id: "sun", text: "Sun", isCorrect: true },
          { id: "moon", text: "Moon", isCorrect: false },
          { id: "star", text: "Star", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: "sentence-completion",
    name: "השלמת משפטים",
    description: "בחירת המילה הנכונה להשלמת משפט באנגלית.",
    questions: [
      {
        id: "sent-cat-table-1",
        text: "The cat is sitting ___ the table.",
        imageUrl: null,
        points: 10,
        options: [
          { id: "on", text: "on", isCorrect: true },
          { id: "in", text: "in", isCorrect: false },
          { id: "under", text: "under", isCorrect: false },
          { id: "above", text: "above", isCorrect: false },
        ],
      },
      {
        id: "sent-like-apples-1",
        text: "I ___ apples.",
        imageUrl: null,
        points: 10,
        options: [
          { id: "likes", text: "likes", isCorrect: false },
          { id: "like", text: "like", isCorrect: true },
          { id: "liking", text: "liking", isCorrect: false },
          { id: "liked", text: "liked", isCorrect: false },
        ],
      },
      {
        id: "sent-sky-1",
        text: "The bird is flying ___ the sky.",
        imageUrl: null,
        points: 10,
        options: [
          { id: "on", text: "on", isCorrect: false },
          { id: "in", text: "in", isCorrect: true },
          { id: "under", text: "under", isCorrect: false },
          { id: "at", text: "at", isCorrect: false },
        ],
      },
      {
        id: "sent-read-1",
        text: "She ___ a book every night.",
        imageUrl: null,
        points: 10,
        options: [
          { id: "reads", text: "reads", isCorrect: true },
          { id: "read", text: "read", isCorrect: false },
          { id: "reading", text: "reading", isCorrect: false },
          { id: "to-read", text: "to read", isCorrect: false },
        ],
      },
      {
        id: "sent-soccer-1",
        text: "They ___ playing soccer in the park.",
        imageUrl: null,
        points: 10,
        options: [
          { id: "is", text: "is", isCorrect: false },
          { id: "are", text: "are", isCorrect: true },
          { id: "am", text: "am", isCorrect: false },
          { id: "be", text: "be", isCorrect: false },
        ],
      },
      {
        id: "sent-has-cats-1",
        text: "I have two ___.",
        imageUrl: null,
        points: 10,
        options: [
          { id: "cat", text: "cat", isCorrect: false },
          { id: "cats", text: "cats", isCorrect: true },
          { id: "cat-s", text: "cat's", isCorrect: false },
          { id: "cats-s", text: "cats'", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: "quick-translation",
    name: "תרגום מהיר",
    description: "תרגום מילים פשוטות מעברית לאנגלית.",
    questions: [
      {
        id: "trans-dog-1",
        text: "כלב",
        imageUrl: null,
        points: 10,
        options: [
          { id: "cat", text: "Cat", isCorrect: false },
          { id: "dog", text: "Dog", isCorrect: true },
          { id: "fish", text: "Fish", isCorrect: false },
          { id: "bird", text: "Bird", isCorrect: false },
        ],
      },
      {
        id: "trans-book-1",
        text: "ספר",
        imageUrl: null,
        points: 10,
        options: [
          { id: "table", text: "Table", isCorrect: false },
          { id: "chair", text: "Chair", isCorrect: false },
          { id: "book", text: "Book", isCorrect: true },
          { id: "bag", text: "Bag", isCorrect: false },
        ],
      },
      {
        id: "trans-house-1",
        text: "בית",
        imageUrl: null,
        points: 10,
        options: [
          { id: "house", text: "House", isCorrect: true },
          { id: "school", text: "School", isCorrect: false },
          { id: "park", text: "Park", isCorrect: false },
          { id: "room", text: "Room", isCorrect: false },
        ],
      },
      {
        id: "trans-water-1",
        text: "מים",
        imageUrl: null,
        points: 10,
        options: [
          { id: "milk", text: "Milk", isCorrect: false },
          { id: "juice", text: "Juice", isCorrect: false },
          { id: "water", text: "Water", isCorrect: true },
          { id: "tea", text: "Tea", isCorrect: false },
        ],
      },
      {
        id: "trans-friend-1",
        text: "חבר",
        imageUrl: null,
        points: 10,
        options: [
          { id: "teacher", text: "Teacher", isCorrect: false },
          { id: "friend", text: "Friend", isCorrect: true },
          { id: "doctor", text: "Doctor", isCorrect: false },
          { id: "driver", text: "Driver", isCorrect: false },
        ],
      },
      {
        id: "trans-family-1",
        text: "משפחה",
        imageUrl: null,
        points: 10,
        options: [
          { id: "friends", text: "Friends", isCorrect: false },
          { id: "family", text: "Family", isCorrect: true },
          { id: "class", text: "Class", isCorrect: false },
          { id: "school", text: "School", isCorrect: false },
        ],
      },
    ],
  },
];

export async function seedDatabase() {
  try {
    console.log("🔍 Checking GameTypes database initialization...");
    for (const gameType of gameTypes) {
      const existing = await GameType.findOne({ id: gameType.id });
      if (!existing) {
        console.log(`🌱 Seeding game type: ${gameType.name} (${gameType.id})`);
        await GameType.create(gameType);
      } else {
        console.log(`ℹ️ Game type ${gameType.name} (${gameType.id}) already exists.`);
        
        // Ensure questions array is updated/populated if empty or out-of-sync
        if (!existing.questions || existing.questions.length < gameType.questions.length) {
          console.log(`🌱 Updating/Seeding questions for ${gameType.name}...`);
          existing.questions = gameType.questions;
          await existing.save();
        }
      }
    }
    console.log("✅ GameTypes database seeding check completed.");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  }
}
