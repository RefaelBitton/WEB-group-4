# Embedded Questions in GameType Design Specification

This specification documents the changes to embed the `questions` array inside the `GameType` schema, eliminating the separate `Question` collection, and removing the redundant `gameId` field from individual questions.

---

## 1. Database Schema Changes

### `packages/game-service/src/models/GameType.js`
We will modify this model to include `optionSchema` and `questionSchema` as subdocuments nested under the `GameType` schema.

*   `questions`: `[questionSchema]`, default `[]`.
*   Each nested question contains:
    *   `id`: `String` (Required, unique within the list or game, trimmed)
    *   `text`: `String` (Trimmed, default `""`)
    *   `imageUrl`: `String` (Default `null`)
    *   `options`: `[optionSchema]` (Must contain at least 2 options and 1 correct option)
    *   `points`: `Number` (Default `10`, min `0`)
    *   `active`: `Boolean` (Default `true`)

### `packages/game-service/src/models/Question.js` [DELETE]
This file will be deleted entirely.

---

## 2. Seed Data Changes (`packages/game-service/src/data/seedData.js`)

We will modify `seedData.js` to embed the questions directly inside the respective `gameTypes` items, and we will no longer export or maintain a separate `seedQuestions` array.

For example:
```javascript
export const gameTypes = [
  {
    id: "image-recognition",
    name: "משחק זיהוי תמונות",
    description: "בחירת המילה באנגלית שמתארת את התמונה.",
    questions: [
      {
        id: "img-cat-1",
        text: "",
        imageUrl: "https://images.unsplash.com/...",
        points: 10,
        options: [ ... ]
      },
      ...
    ]
  },
  ...
];
```

---

## 3. Service Logic Changes (`packages/game-service/src/services/gameService.js`)

Since `Question` is no longer a separate model, all database and memory queries for questions must go through `GameType`.

### `getQuestionPool(gameId)`
*   **Database Connected**: Query the database using `GameType.findOne({ id: gameId, active: true }).lean()`. Then filter and map its `questions` subdocument array to return the active ones.
*   **Database Offline**: Find the game type in seed data using `gameTypes.find(g => g.id === gameId)` and return its active questions.

### `findQuestion(gameId, questionId)`
*   Update `findQuestion` signature to take `gameId` to efficiently scope the query.
*   **Database Connected**: Query `GameType.findOne({ id: gameId })` and find the specific question with `questionId` inside its `questions` array.
*   **Database Offline**: Find the game type in seed data and extract the question.

---

## 4. Verification and Legacy Cleanup

### `packages/game-service/src/verifySession.js`
*   Replace imports of `Question` with `GameType`.
*   Update the seeding section to seed a test question by modifying or upserting the corresponding `GameType` document (e.g. updating the `questions` array on the `image-recognition` `GameType`).

### Documentation Update (`docs/db_structure.md`)
*   Update the document to remove the `questions` collection section.
*   Embed the question schema structure and the option sub-schema structure inside the `gametypes` collection table.
