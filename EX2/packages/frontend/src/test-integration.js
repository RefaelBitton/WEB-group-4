import io from 'socket.io-client';

const GATEWAY_URL = 'http://localhost:4000';

async function runTests() {
  console.log('🚀 מתחיל בדיקת אינטגרציה SPRINT 3: Backend ו-WebSocket...');
  
  const suffix = Math.floor(Math.random() * 100000);
  const parentEmail = `parent_${suffix}@test.com`;
  const parentName = `Parent ${suffix}`;
  const childUsername = `child_${suffix}`;
  const childName = `Child ${suffix}`;
  const pin = '1234';

  console.log(`\n1. Registering Parent: ${parentEmail}...`);
  const parentRegRes = await fetch(`${GATEWAY_URL}/api/users/parents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: parentName, email: parentEmail, password: 'password123' })
  });
  if (!parentRegRes.ok) {
    throw new Error(`Parent registration failed: ${await parentRegRes.text()}`);
  }
  const parentData = await parentRegRes.json();
  console.log('✅ ההורה נרשם בהצלחה. הושג טוקן.');

  const parentToken = parentData.accessToken;

  console.log(`\n2. Creating Child profile: ${childUsername}...`);
  const childCreateRes = await fetch(`${GATEWAY_URL}/api/users/children`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${parentToken}`
    },
    body: JSON.stringify({ name: childName, username: childUsername, pin, age: 8, englishLevel: 'beginner' })
  });
  if (!childCreateRes.ok) {
    throw new Error(`Child creation failed: ${await childCreateRes.text()}`);
  }
  const childCreateData = await childCreateRes.json();
  const childId = childCreateData.user._id;
  console.log(`✅ הילד נוצר בהצלחה. מזהה: ${childId}`);

  console.log('\n3. Logging in as Child...');
  const childLoginRes = await fetch(`${GATEWAY_URL}/api/users/children/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: childUsername, pin })
  });
  if (!childLoginRes.ok) {
    throw new Error(`Child login failed: ${await childLoginRes.text()}`);
  }
  const childLoginData = await childLoginRes.json();
  console.log('✅ הילד הוכנס בהצלחה. הושג טוקן גישה.');

  console.log('\n4. Fetching initial Gamification stats...');
  const initialStatsRes = await fetch(`${GATEWAY_URL}/api/reports/gamification/${childId}`);
  if (!initialStatsRes.ok) {
    throw new Error(`Failed to fetch stats: ${await initialStatsRes.text()}`);
  }
  const initialStats = await initialStatsRes.json();
  console.log('✅ סטטיסטיקות הגמיפיקציה נשלפו:', initialStats);
  if (initialStats.points !== 0 || initialStats.rank !== 'Beginner') {
    throw new Error('Initial points or rank do not match expected defaults.');
  }

  console.log('\n5. Establishing WebSockets connection to Gateway...');
  const socket = io(GATEWAY_URL);
  
  await new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`✅ מחובר לשער ה-WebSocket. Socket ID: ${socket.id}`);
      resolve();
    });
    socket.on('connect_error', (err) => reject(err));
  });

  const milestonePromise = new Promise((resolve) => {
    socket.on('gamification-milestone', (data) => {
      console.log('🔥 התקבל אירוע ציון דרך בגמיפיקציה דרך WebSocket:', data);
      if (data.userId === childId) {
        resolve(data);
      }
    });
  });

  console.log('\n6. Awarding points for event: "game_completed"...');
  const awardRes = await fetch(`${GATEWAY_URL}/api/reports/gamification/award`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: childId, eventType: 'game_completed' })
  });
  if (!awardRes.ok) {
    throw new Error(`Award failed: ${await awardRes.text()}`);
  }
  const awardData = await awardRes.json();
  console.log('✅ בקשת הענקת נקודות הצליחה:', awardData);

  console.log('Sending gamification-event through socket to trigger gateway broadcast...');
  socket.emit('gamification-event', {
    userId: childId,
    eventType: 'game_completed',
    totalPoints: awardData.totalPoints,
    newRank: awardData.newRank,
    newAchievement: awardData.newAchievement,
    achievements: awardData.achievements
  });

  console.log('Waiting for WebSocket milestone notification...');
  const milestoneData = await milestonePromise;
  console.log('✅ אימות אירוע ציון הדרך בזמן אמת דרך WebSocket הושלם!');

  console.log('\n7. Fetching updated Gamification stats...');
  const finalStatsRes = await fetch(`${GATEWAY_URL}/api/reports/gamification/${childId}`);
  const finalStats = await finalStatsRes.json();
  console.log('✅ סטטיסטיקות הגמיפיקציה עודכנו:', finalStats);
  if (finalStats.points !== 30) {
    throw new Error(`Expected points to be 30, got ${finalStats.points}`);
  }

  socket.disconnect();
  console.log('\n🎉 כל בדיקות האינטגרציה של ספרינט 3 עברו בהצלחה! 🎉');
}

runTests().catch(err => {
  console.error('❌ E2E integration test failed:', err);
  process.exit(1);
});
