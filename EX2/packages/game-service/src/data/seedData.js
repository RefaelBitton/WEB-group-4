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
    ],
  },
];
