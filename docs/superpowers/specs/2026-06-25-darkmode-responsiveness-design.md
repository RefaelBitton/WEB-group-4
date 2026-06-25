# Design Spec: Dark Mode and Mobile Responsiveness

Design specification for adding a manual/system Dark Mode toggle and making the website responsive on mobile/phone screens.

## 1. Goal & Context
The goal is to implement a high-quality manual Dark Mode toggle (floating action button) and make the entire site completely responsive to mobile phone viewports, using a custom bottom navigation bar for mobile navigation.

---

## 2. Proposed Changes

### Global Configurations

#### [MODIFY] [index.html](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/index.html)
- Add `<meta name="color-scheme" content="light dark">` to prevent flash of unthemed content.
- Inject a lightweight inline script to read the preferred/saved theme from `localStorage` and set the `.dark` class on `document.documentElement` immediately.

#### [MODIFY] [style.css](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/style.css)
- Add custom Tailwind v4 dark variant: `@variant dark (&:where(.dark, .dark *));`.
- Update standard root CSS properties to also change when `.dark` is applied.
- Ensure custom scrollbar colors adapt dynamically using `light-dark()` or CSS variables in dark mode.
- Make the main `#app` container responsive (remove rigid width on small viewports).

---

### New Components

#### [NEW] [ThemeToggle.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/components/ThemeToggle.jsx)
- Floating Action Button (FAB) rendered in the bottom-left/bottom-right corner of the screen.
- Accessible on all routes.
- Persists state in `localStorage` and toggles `.dark` class.

#### [NEW] [BottomNavBar.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/components/BottomNavBar.jsx)
- A mobile bottom navigation bar visible only on screens `< 768px` (using Tailwind class `md:hidden`).
- Contains links to Home (Child Dashboard), Games, Bot Chat, Grammar Hero, and Logout.
- Uses dynamic/active state styling.

---

### Component Styling Updates
Make the following pages fully responsive and styled for Dark Mode (using Tailwind `dark:` classes and responsive flex/grid layouts):

#### [MODIFY] [Login.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/Login.jsx) and [Signup.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/Signup.jsx)
- Add dark mode bg/text support for form containers and inputs.
- Ensure inputs are fully visible and readable in dark mode.

#### [MODIFY] [ChildDashboard.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/ChildDashboard.jsx)
- Update 4-button grid layout to stack on mobile (1 column on mobile, 2 columns on desktop).
- Add spacing, padding adjustment, and dark mode background/shadow configurations.
- Hide standard logout button on mobile (now handled by the Bottom Navigation Bar).

#### [MODIFY] [ParentPortal.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/user/presentation/ParentPortal.jsx)
- Update parent portals to handle modal overlays and layout responsiveness.
- Make report modals scrollable and adjust width dynamically.

#### [MODIFY] [BotChat.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/presentation/BotChat.jsx)
- Chat window height (`75vh`) and input bar adjusted for mobile viewports (e.g. padding and margins).
- Fix text-area sizing and overlay issues on phone keyboard focus.

#### [MODIFY] [GameHub.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/game/presentation/GameHub.jsx)
- Games grids and progress bars scaled down for small screens.
- Game completion cards and button actions adapted for mobile layout.

#### [MODIFY] [GrammarHeroProfile.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/gamification/presentation/GrammarHeroProfile.jsx)
- Achievements grid layout adjusted for smaller screens.
- Progress bars and stats metrics scaled down.

#### [MODIFY] [EnglishArena.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/arena/presentation/EnglishArena.jsx)
- Audio rooms cards, active call interface, and conversation cards optimized for mobile screens.

---

## 3. Verification Plan

### Automated Tests
- Build and compile check: `npm run build` inside `packages/frontend` to verify all components compile correctly and there are no syntax/TypeScript errors.

### Manual Verification
- Test Dark Mode toggle state persistence using browser storage.
- Resize viewport to typical mobile screen dimensions (375px - 430px) using browser devtools and inspect layout and alignment.
- Verify bottom navigation is active and navigates correctly on mobile viewports.
- Check accessibility (Tap targets size, input contrast).
