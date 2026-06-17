# Developer Setup Guide: Database Seeding & Questions Population

This document explains how the English learning bot questions database is populated and seeded across developer environments. It serves as guidelines for agents and developers to set up the data models on new machines.

## Overview
The application uses a **MongoDB** database to store minigames, questions, and active user game sessions. 
To avoid manual database updates, an automatic seeding mechanism runs on service startup.

## Automatic Seeding

When the **Game Service** starts up and connects successfully to MongoDB, it calls the `seedDatabase()` routine defined in `packages/game-service/src/data/seedData.js`.

The seeding routine performs the following checks:
1. It loops through each defined game type (e.g., `image-recognition`, `sentence-completion`, `quick-translation`).
2. If the game type does not exist in the `gametypes` collection, it seeds the entire game type object along with its default questions.
3. If the game type already exists, it checks the length of the questions array. If the questions array in the database is smaller than the seed data (or empty), it updates the questions array to ensure the latest questions are present.

## How to Seed on a New Developer PC

Simply running the development server will trigger database seeding automatically.

### Step 1: Set up the environment file
Ensure you have a `.env` file in the `EX2/` folder containing the correct `MONGO_URI`. For example:
```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/english_learning_bot?authSource=admin
```

### Step 2: Start the application
Run the development command in the monorepo root:
```bash
npm run dev
```

### Step 3: Verify seeding
Look for the following log output in the console from the `[game]` process:
```text
[game] Connected to MongoDB successfully for Game Service
[game] 🔍 Checking GameTypes database initialization...
[game] 🌱 Seeding game type: משחק זיהוי תמונות (image-recognition)
[game] 🌱 Seeding game type: השלמת משפטים (sentence-completion)
[game] 🌱 Seeding game type: תרגום מהיר (quick-translation)
[game] ✅ GameTypes database seeding check completed.
```

## Resetting or Re-Seeding the Questions
If you modify `seedData.js` and want to re-seed the questions from scratch:
1. Connect to your local MongoDB (e.g., via Mongo Shell or Compass).
2. Switch to the `english_learning_bot` database.
3. Drop the `gametypes` collection:
   ```javascript
   db.gametypes.drop()
   ```
4. Restart the **Game Service** (or save a file to trigger the nodemon watcher reload), and it will re-seed the full list of questions automatically.
