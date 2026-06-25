# Chatbot Age-Based Tailoring Design Spec

We want to tailor the chatbot's conversations to the age of the child using it, in addition to tailoring by their English level.

## Context and Current Behavior
- Currently, when a child chats with the bot, the backend retrieves their `englishLevel` using the authenticated user's ID (`req.auth?.sub`).
- The system instructions dynamically incorporate this level (`beginner`/`basic`/`intermediate` mapped to CEFR levels A1/A2/B1).
- The user's age (between 6 and 12 years) is already stored in the Mongoose database but is not used to adjust the conversation behavior.

## Proposed Changes
We will update `bot-service` to query the user's `age` from the MongoDB database, then dynamically adapt both the chat system instruction and the conversation starter prompt depending on the child's age.

### 1. Database Query Update
We will replace `getChildLevel` with a new helper, `getChildDetails`, in [chat.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/bot-service/src/routes/chat.js). This helper will query the user document and return both `childLevel` and `childAge`.

```javascript
async function getChildDetails(req) {
  let childLevel = 'beginner';
  let childAge = 8; // Default fallback to a middle age
  const sessionKey = req.auth?.sub;
  
  if (sessionKey && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(sessionKey)) {
    try {
      const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(sessionKey) });
      if (user) {
        if (user.englishLevel) {
          childLevel = user.englishLevel;
        }
        if (user.age) {
          childAge = user.age;
        }
      }
    } catch (err) {
      console.error('Error fetching child details from users collection in bot-service:', err);
    }
  }
  return { childLevel, childAge };
}
```

### 2. Prompt Adaptation
The prompt generated for the system instructions in `/chat` and `/evaluate` will be customized using the retrieved age.

- **Ages 6-8 (Younger kids)**:
  - **Tone**: Playful, simple, highly encouraging, and game-like.
  - **Topics**: Focused on animals, toys, colors, pets, family, simple games, and school.
- **Ages 9-12 (Older kids)**:
  - **Tone**: Conversational, friendly, and slightly more mature.
  - **Topics**: Focused on hobbies, video games, sports, favorite books/movies, friends, and school subjects.

We will build an `agePrompt` string dynamically:
```javascript
let agePrompt = '';
if (childAge <= 8) {
  agePrompt = `The child is ${childAge} years old. Adopt a highly playful, simple, and encouraging tone. Focus topics strictly on early-elementary interests: animals, toys, colors, pets, family, simple games, and school.`;
} else {
  agePrompt = `The child is ${childAge} years old. Adopt a conversational, friendly, and slightly more mature tone. Focus topics on late-elementary interests: hobbies, video games, sports, favorite books/movies, friends, and school subjects.`;
}
```

This prompt will be appended to the `dynamicInstruction` sent to Gemini.

### 3. Conversation Starter Adaptation
We will update `/starter` to generate an age-appropriate conversation starter:
```javascript
let ageStarterConstraint = '';
if (childAge <= 8) {
  ageStarterConstraint = `The child is ${childAge} years old. The topic should be suitable for a young child (e.g., animals, toys, colors, pets).`;
} else {
  ageStarterConstraint = `The child is ${childAge} years old. The topic should be suitable for an older child (e.g., hobbies, games, sports, school, movies).`;
}
```
This is injected into the Gemini prompt for starting the chat.

## Verification Plan
1. Send chat request with a user whose age is 6-8, verify topics and tone are young-child-friendly.
2. Send chat request with a user whose age is 9-12, verify topics and tone are older-child-friendly.
3. Test that fallback values are handled correctly when the age is missing or MongoDB is unavailable.
