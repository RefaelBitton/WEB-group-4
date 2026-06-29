כיצד להגדיר STUN/TURN עבור סביבת הפרויקט

1. עבור סביבות פיתוח מקומיות, השתמש בשרתי STUN ציבוריים (למשל `stun:stun.l.google.com:19302`).
2. עבור פרודקשן, יש להתקין שירות TURN (coturn) ולהגדיר שם משתמש וסיסמה. לאחר מכן יש למלא את הערכים הבאים בסביבת הפריסה (Vercel/Render):
   - `VITE_TURN_URL` - כתובת ה-TURN (לדוגמה: `turn:turn.example.com:3478`)
   - `VITE_TURN_USERNAME`
   - `VITE_TURN_PASSWORD`
3. ודאו ששירות ה-TURN מותר ב-Firewall ושהפורט 3478 פתוח (UDP/TCP) במידת הצורך.
4. לקונפיגורציה ב-JS/TS בדפדפן, יש להשתמש במשתנה `import.meta.env.VITE_STUN_SERVERS` ו-`import.meta.env.VITE_TURN_URL` בעת יצירת `RTCIceServer` list.

דוגמה ליצירת peerConnection:

```js
const iceServers = [
  { urls: import.meta.env.VITE_STUN_SERVERS?.split(',') || ['stun:stun.l.google.com:19302'] },
];
if (import.meta.env.VITE_TURN_URL) {
  iceServers.push({
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME,
    credential: import.meta.env.VITE_TURN_PASSWORD
  });
}
const pc = new RTCPeerConnection({ iceServers });
```

5. הערה על פרטיות: אל תכללו אישורי TURN בקוד המקור; השתמשו במשתני סביבה בסביבת ההרצה בלבד.
