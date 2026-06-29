# מפרט טכני, חיבורים וסביבות עבודה

מסמך זה מרכז את כל פרטי המפרט הטכני של הפרויקט, כולל רשימת ה-APIs המלאה, פרטי חיבור למסד הנתונים ומנגנוני גיבוי, סביבות ריצה מיוחדות, קטעי קוד מורכבים עם קרדיטים, פרומפטים ששימשו עבור ה-AI, והגדרות משתמשי בדיקה.

---

## 1. פירוט ממשקי ה-API (API Documentation)

המערכת משתמשת בשער גישה (API Gateway) המאזין בפורט `4000` ומנתב את הבקשות למיקרו-שירותים השונים.

### 1.1. שירות משתמשים (User Service - פורט 3001)
מנהל את פרופילי ההורים והילדים:

| מתודה | נתיב Gateway | נתיב ישיר | תיאור | גוף הבקשה (Payload) | תגובה מוצלחת |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/users/parents/register` | `/parents/register` | הרשמת הורה חדש | `{ name, email, password }` | `{ user, accessToken }` |
| **POST** | `/api/users/parents/login` | `/parents/login` | התחברות הורה | `{ email, password }` | `{ user, accessToken }` |
| **POST** | `/api/users/children` | `/children` | יצירת פרופיל ילד (הורה בלבד) | `{ name, username, pin, age, englishLevel }` | `{ user: { _id, role, parentId... } }` |
| **POST** | `/api/users/children/login` | `/children/login` | התחברות ילד | `{ username, pin }` | `{ user, accessToken }` |
| **GET** | `/api/users/me` | `/me` | שליפת פרטי המשתמש הנוכחי | *ריק (טוקן Bearer בכותרת)* | `{ user }` |
| **PATCH** | `/api/users/me` | `/me` | עדכון פרטי משתמש | `{ name, age, englishLevel }` | `{ user }` |
| **GET** | `/api/users/children` | `/children` | שליפת רשימת הילדים של ההורה | *ריק (טוקן Bearer בכותרת)* | `{ children: [...] }` |

### 1.2. שירות בוט השיחה (Bot Service - פורט 3002)
מנהל את מנוע ה-AI והתמלול:

| מתודה | נתיב Gateway | נתיב ישיר | תיאור | גוף הבקשה (Payload) | תגובה מוצלחת |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/bot/chat` | `/api/bot/chat` | שליחת הודעה וקבלת תגובה משולבת | `{ message, history: [...] }` | `{ role: "bot", content: "...", evaluation: {...} }` |
| **POST** | `/api/bot/evaluate` | `/api/bot/evaluate` | קבלת הערכת דקדוק מובנית בלבד | `{ message, history: [...] }` | `{ response, hasErrors, correction }` |
| **POST** | `/api/bot/transcribe` | `/api/bot/transcribe` | תמלול קובץ קולי (STT) | `{ audio: "base64...", mimeType: "..." }` או קובץ בינארי | `{ transcription, text }` |
| **GET** | `/api/bot/starter` | `/api/bot/starter` | יצירת פתיח שיחה מותאם גיל ורמה | *ריק (טוקן Bearer בכותרת)* | `{ starter: "..." }` |

### 1.3. שירות המשחקים (Game Service - פורט 3003)
מנהל את המיני-משחקים והשלבים:

| מתודה | נתיב Gateway | נתיב ישיר | תיאור | גוף הבקשה (Payload) | תגובה מוצלחת |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/games/list` | `/api/games/list` | שליפת רשימת המשחקים הפעילים | *ריק* | `{ games: [...] }` |
| **GET** | `/api/games/:gameId/session`| `/api/games/:gameId/session`| שליפת השאלה הבאה בסשן | *ריק (טוקן Bearer בכותרת)* | `{ id, text, imageUrl, options: [...] }` |
| **POST** | `/api/games/:gameId/answer` | `/api/games/:gameId/answer` | הגשת תשובה ובדיקת נכונות | `{ answerId }` | `{ correct, pointsEarned, correctAnswerId }` |
| **GET** | `/api/games/image/proxy` | `/api/games/image/proxy` | מנהרת תמונות (לעקיפת CORS) | *פרמטר url בשאילתה* | קובץ התמונה (בינארי) |

### 1.4. שירות דיווח וגמיפיקציה (Reporting Service - פורט 3004)
מנהל את הניקוד, ההישגים והדוחות להורים:

| מתודה | נתיב Gateway | נתיב ישיר | תיאור | גוף הבקשה (Payload) | תגובה מוצלחת |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/reports/gamification/:userId`| `/gamification/:userId`| שליפת נקודות ותארים של הילד | *ריק* | `{ points, rank, achievements: [...] }` |
| **POST** | `/api/reports/gamification/award`| `/gamification/award`| הענקת נקודות על אירוע | `{ userId, eventType }` | `{ success, pointsAwarded, totalPoints... }` |
| **POST** | `/api/reports/activities/log` | `/activities/log` | רישום פעילות (משחק/שיחה) | `{ userId, activityType, gameId, details... }`| `{ success, log: {...} }` |
| **GET** | `/api/reports/progress/:userId`| `/progress/:userId`| הפקת דוח התקדמות מקיף להורה | *ריק* | `{ timeSpent, successRates, subjectsCovered... }`|

---

## 2. קישור למסד הנתונים (Database Connection & Resilience)

* **טכנולוגיה**: MongoDB בשילוב עם ספריית Mongoose כ-ODM.
* **נתיב ברירת מחדל לחיבור (Connection URI)**:
  `mongodb://localhost:27017/english_learning_bot` (או דרך משתנה סביבה `MONGO_URI` המוגדר בקובץ `.env`).
* **מנגנון גיבוי וחוסן (Database Fallback)**:
  כדי למנוע קריסה של המערכת בסביבות מפתחים מקומיות בהן שרת ה-MongoDB אינו זמין, שירות המשחקים ושירות הדיווח כוללים מנגנוני Fallback אוטומטיים:
  * **שירות המשחק**: אם החיבור למסד הנתונים נכשל, השירות פועל במצב "InMemory" ומגיש שאלות ישירות מתוך קבצי ה-JSON המקומיים (`sentenceCompletionQuestions.json` וכו').
  * **שירות הדיווח**: משתמש בקובץ `dbFallback.js` המגדיר מערכים ומפות בזיכרון (`inMemoryProgress`, `inMemoryActivities`). המערכת מזהה את מצב החיבור (`mongoose.connection.readyState !== 1`) ומנווטת את השאילתות והשמירות אל הזיכרון הדינמי במקום למסד הנתונים השבור, מה שמבטיח עבודה חלקה בכל תנאי.

---

## 3. סביבות מיוחדות וכלים (Special Environments)

המערכת רצה בארכיטקטורת **Monorepo** עם חלוקה לרכיבים:
1. **ניהול מונורפו**: הגדרת `workspaces` בקובץ `package.json` הראשי תחת ספריית `packages`.
2. **ריצה במקביל**: שימוש בחבילת `concurrently` להרצת כל 6 תהליכי הפיתוח (הפרונטאנד וחמשת המיקרו-שירותים) בפקודה אחת: `npm run dev`.
3. **עיצוב צד לקוח**: הטמעת **Tailwind CSS v4** המותקן דרך Vite Plugin החדש (`@tailwindcss/vite`).
4. **ניהול מצב (State Management)**: שימוש ב-**Zustand** עבור חנויות נתונים קלות וריאקטיביות בצד הלקוח (`useUserStore`, `useArenaStore`, `useGamificationStore`).
5. **תקשורת קולית מבוזרת**: עבודה ישירה עם פרוטוקול **WebRTC** מובנה בדפדפן בשילוב עם **Socket.IO-Client** המשמש כשרת סיגנליזציה (Signaling Server) בשער הראשי.

---

## 4. קטעי קוד מיוחדים ומקורות (Special Code Snippets)

### 4.1. תמלול קול עם Gemini 3.1 Flash Lite
נעשה שימוש ביכולות המולטימודליות הנייטיב של ה-SDK החדש של גוגל (`@google/genai`) לצורך זיהוי דיבור ישיר מקובץ שמע ללא צורך בשירות חיצוני נוסף:

```javascript
// מקור: Google Gen AI SDK v2 Documentation (https://github.com/googleapis/nodejs-genai)
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-3.1-flash-lite',
  contents: [
    {
      inlineData: {
        mimeType: mimeType, // לדוגמה 'audio/webm'
        data: audioBase64  // קובץ השמע בפורמט Base64
      }
    },
    'Transcribe the speech in this audio file. Output only the transcript, with no extra text.'
  ]
});
const transcription = response.text.trim();
```

### 4.2. מעטפת ניהול תקשורת P2P WebRTC
ניהול יצירת החיבור הדו-כיווני, החלפת מפרטי ה-SDP, וטיפול דינמי בתור מועמדי ה-ICE (לפני הגדרת התיאור המרוחק כדי למנוע שגיאות סינכרון):

```javascript
// רפרנס מבוסס על MDN WebRTC API Guide (https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
export class WebRTCHandler {
  constructor(socket, peerSocketId, onStreamCallback, onConnectionStateChange) {
    this.socket = socket;
    this.peerSocketId = peerSocketId;
    this.onStreamCallback = onStreamCallback;
    this.onConnectionStateChange = onConnectionStateChange;
    this.peerConnection = null;
    this.iceCandidatesQueue = [];
  }

  async init(localStream) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
    });

    localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      const stream = event.streams[0] || new MediaStream([event.track]);
      this.onStreamCallback(stream);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          target: this.peerSocketId,
          candidate: event.candidate,
        });
      }
    };
  }

  async handleIceCandidate(candidate) {
    if (this.peerConnection && this.peerConnection.remoteDescription?.type) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      this.iceCandidatesQueue.push(candidate);
    }
  }
}
```

---

## 5. פרומפטים ששימשו את כלי ה-AI (AI Prompts)

עבור בוט השיחה והערכת השגיאות שולבו הפרומפטים הבאים המגדירים את התנהגות מודל השפה הגנרטיבי:

### 5.1. פרומפט המערכת של בוט השיחה (System Prompt)
```text
You are a friendly, encouraging English teacher for children (ages 6-12).
Your goal is to have short, simple English conversations with the child to help them practice.

You must respond in JSON format matching the schema provided:
1. In the 'response' field, speak to the child ONLY in simple, easy-to-understand English. Keep sentences short and always end with a simple follow-up question in English to keep the conversation going. Do NOT include any Hebrew here.
2. Be extremely vigilant and check the child's input very carefully for any grammar, spelling, capitalization, punctuation, or word choice mistakes. If the child makes any such mistake, you MUST set 'hasErrors' to true. Do NOT be lenient. An encouraging tone does NOT mean ignoring mistakes; correcting them gently in Hebrew is essential for their learning!
3. If 'hasErrors' is true, provide a gentle, clear error correction ONLY in Hebrew in the 'correction' field. Explain the mistake simply and how to say it correctly (e.g., "שים לב, אומרים I have במקום I has."). If 'hasErrors' is false, leave 'correction' as an empty string.

Example interaction:
Child: "I has a dog."
Your JSON response:
{
  "response": "That's wonderful! I love dogs. What is your dog's name?",
  "hasErrors": true,
  "correction": "שים לב, אומרים I have במקום I has."
}
```

### 5.2. התאמת גיל ורמה דינמית (Dynamic Constraints Prompt)
בזמן ריצה, מתווספות הנחיות נוספות בהתאם לפרופיל הילד שנשלף מהדאטאבייס:
* **עבור רמות CEFR**:
  * **A1 (Beginner)**: `Use only simple present tense, very common words (e.g. dog, cat, apple, like, run), and very short questions.`
  * **A2 (Basic)**: `Use simple present and simple past tense, simple conjunctions, and slightly broader vocabulary.`
  * **B1 (Intermediate)**: `Use a mix of tenses (including perfect tenses), more varied adjectives/adverbs, and discuss slightly more advanced everyday topics.`
* **עבור גיל**:
  * **מתחת לגיל 8**: `Adopt a highly playful, simple, and encouraging tone. Focus topics strictly on early-elementary interests: animals, toys, colors, pets, family, simple games, and school.`
  * **מעל גיל 8**: `Adopt a conversational, friendly, and slightly more mature tone. Focus topics on late-elementary interests: hobbies, video games, sports, favorite books/movies, friends, and school subjects.`

---

## 6. פרטי התחברות וחשבונות בדיקה (User Credentials)

המערכת מנהלת רישום משתמשים באופן דינמי ואין משתמשי קצה קבועים (Hardcoded) שנשמרים בקוד ה-Production. עם זאת, לצורך הרצת בדיקות E2E ואינטגרציה של מפתחים, הוגדרו הפרמטרים הבאים המשמשים את סקריפט הבדיקה `test-integration.js`:

### 6.1. פרטי משתמש דוגמה לבדיקות ידניות ואוטומטיות
בדיקות האינטגרציה והפיתוח המקומי רצות בדרך כלל על בסיס הנתונים המקומי ומייצרות חשבונות במבנה הבא:

* **סוג משתמש הורה (Parent)**:
  * **כתובת דוא"ל (Email)**: `parent_12345@test.com` (כאשר `12345` הוא מספר רנדומלי הנוצר בכל ריצה).
  * **סיסמה (Password)**: `password123` (או כל סיסמה באורך 6 תווים ומעלה במהלך ההרשמה הדינמית).
  
* **סוג משתמש ילד (Child)**:
  * **שם משתמש (Username)**: `child_12345` (נוצר תחת ההורה בממשק הניהול).
  * **קוד כניסה (PIN)**: `1234` (קוד המורכב מ-4 ספרות עבור כניסה מהירה של ילדים).
