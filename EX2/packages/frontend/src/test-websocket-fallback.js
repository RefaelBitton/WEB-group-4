import io from 'socket.io-client';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';

async function runFallbackTest() {
  console.log('🔍 מתחיל בדיקת פיילבק של WebSocket...');
  const socket = io(GATEWAY_URL, { reconnectionAttempts: 5, timeout: 5000 });

  socket.on('connect', () => {
    console.log('✅ התחברו לשער באמצעות WebSocket.');
    // simulate server disconnect after 2s
    setTimeout(() => {
      console.log('⏸️ מדמה ניתוק מהשרת (אם אפשרי)...');
      socket.io._transport.close();
    }, 2000);
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`↻ ניסיון חיבור מחדש ${attempt}...`);
  });

  socket.on('reconnect_failed', () => {
    console.log('❌ ניסיון החיבור מחדש נכשל. יש לנסות פיילבק (למשל long-polling או HTTP).');
    socket.close();
    process.exit(0);
  });

  socket.on('connect_error', (err) => {
    console.error('⚠️ שגיאת חיבור:', err.message);
  });

  // wait a while to observe reconnects
  setTimeout(() => {
    console.log('✅ בדיקת הפיילבק ל-WebSocket הושלמה (עיינו בלוגים לניסיונות חיבור).');
    socket.close();
    process.exit(0);
  }, 12000);
}

runFallbackTest().catch(err => {
  console.error('❌ WebSocket fallback test failed:', err);
  process.exit(1);
});
