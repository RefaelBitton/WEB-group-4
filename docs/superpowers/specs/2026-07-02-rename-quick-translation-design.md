# Rename "Quick Translation" to "Single Word Translation" Design Spec

## Overview
Rename the game type "Quick Translation" from "תרגום מהיר" to "תרגום מילים בודדות" in all user-facing parts of the application. The system ID `quick-translation` will remain unchanged to prevent database migration risks and ensure backward compatibility with existing databases, routes, and logging logic.

## Requirements
1. **Database Seeding Update**:
   - Update `seedData.js` in `game-service` so that when the database is seeded, the display name of the `quick-translation` game type is updated to "תרגום מילים בודדות" in MongoDB.
2. **Frontend UI Updates**:
   - Update `GameHub.jsx` where the games lists are initialized/mapped.
   - Update `QuickTranslation.jsx` game header text.
3. **Reporting Service Display Updates**:
   - Update `reportsRoutes.js` in `reporting-service` so that the activity breakdown shows "תרגום מילים בודדות 🌐".

## Proposed Changes

### Backend - Game Service

#### [MODIFY] [seedData.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/game-service/src/data/seedData.js)
* Change name of game with ID `quick-translation` to `"תרגום מילים בודדות"`.

### Backend - Reporting Service

#### [MODIFY] [reportsRoutes.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/reporting-service/routes/reportsRoutes.js)
* In `GAME_MAPPING`, change the value for `quick-translation` to `"תרגום מילים בודדות 🌐"`.

### Frontend - Game Feature

#### [MODIFY] [GameHub.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/game/presentation/GameHub.jsx)
* In the fallback games list inside `GameHub`, change the name of the game with ID `quick-translation` to `"תרגום מילים בודדות"`.

#### [MODIFY] [QuickTranslation.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/game/presentation/QuickTranslation.jsx)
* Change the game title in `h2` to `"תרגום מילים בודדות"`.

## Verification Plan

### Automated Build Check
- Run `npm run build -w packages/frontend` to ensure compilation is successful.

### Manual Verification
1. Run database seeding using seed command.
2. Open frontend, navigate to Game Hub, and verify that the game card is labeled "תרגום מילים בודדות".
3. Click the game, verify that the header displays "תרגום מילים בודדות".
4. Complete the game, check parental progress portal, and verify reports display "תרגום מילים בודדות 🌐".
