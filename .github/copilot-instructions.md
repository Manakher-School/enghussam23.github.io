# Copilot Instructions for School Educational Platform

## Project Overview

This is a **React Native + Expo web application** (`enghussam23.github.io`) serving as an educational platform for students (KG–11 & Tawjihi). The app is built for cross-platform deployment (web via GitHub Pages, with future mobile support).

## Architecture & Technology Stack

- **Framework**: React Native with Expo (Web + Mobile)
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: React Context API
- **i18n**: react-i18next (Arabic primary, English secondary)
- **Deployment**: GitHub Pages (static build from `docs/` folder)
- **Data**: Local mock data (JSON structures in `/src/data/`)
- **Offline**: AsyncStorage + caching strategy

## Project Structure

```
/
├── App.js                      # Main entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler config
├── docs/                       # GitHub Pages build output
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js     # Tab navigation setup
│   ├── screens/
│   │   ├── HomeworkScreen.js   # Homework tab
│   │   ├── MaterialsScreen.js  # Materials tab
│   │   ├── NewsScreen.js       # News tab
│   │   └── QuizzesScreen.js    # Quizzes tab (if separate)
│   ├── components/
│   │   ├── CommentSection.js   # Comments UI
│   │   ├── SearchBar.js        # Global search
│   │   ├── MaterialCard.js     # Material display card
│   │   ├── HomeworkCard.js     # Homework display card
│   │   └── NewsCard.js         # News display card
│   ├── context/
│   │   ├── DataContext.js      # Global data state
│   │   └── LanguageContext.js  # i18n context
│   ├── data/
│   │   ├── homework.json       # Mock homework data
│   │   ├── materials.json      # Mock materials data
│   │   ├── news.json           # Mock news data
│   │   └── quizzes.json        # Mock quizzes data
│   ├── services/
│   │   ├── storage.js          # AsyncStorage utilities
│   │   ├── notifications.js    # Push notification setup
│   │   └── cache.js            # Offline caching logic
│   ├── locales/
│   │   ├── ar.json             # Arabic translations
│   │   └── en.json             # English translations
│   └── theme/
│       └── theme.js            # React Native Paper theme
└── assets/                     # Images, fonts, icons
```

## Development Conventions

### Code Style

- **Component Names**: PascalCase (e.g., `HomeworkScreen`, `MaterialCard`)
- **File Names**: PascalCase for components, camelCase for utilities
- **Hooks**: Use functional components with hooks (no class components)
- **Props**: Destructure in function signature
- **Async Operations**: Use async/await, handle errors with try/catch

### Data Structure Patterns

All mock data follows consistent schema:

```js
{
  id: "unique-id",
  title: { ar: "العنوان", en: "Title" },
  content: { ar: "المحتوى", en: "Content" },
  date: "ISO 8601 timestamp",
  metadata: { /* item-specific fields */ }
}
```

### Navigation

- Bottom tabs: Homework, Materials, News (Quizzes in Homework tab)
- Use `react-navigation` with proper type safety
- Deep linking configured for `/homework`, `/materials`, `/news`

### Internationalization

- Primary: Arabic (RTL layout)
- Secondary: English (LTR layout)
- Use `useTranslation()` hook in all components
- Store all strings in `/src/locales/*.json`
- React Native Paper supports RTL automatically

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start Expo dev server (web)
npx expo start --web

# Or use Expo Go for mobile testing
npx expo start
```

### Building for GitHub Pages

```bash
# Build web bundle
npx expo export:web

# Output goes to web-build/ (then copy to docs/)
npm run deploy  # Custom script that builds and moves to docs/
```

### Testing

- **Web**: Test in Chrome, Firefox, Safari
- **Mobile Preview**: Use Expo Go app to test on device
- **Offline**: Disable network in DevTools to verify caching
- **RTL**: Switch language to Arabic to test layout

### GitHub Pages Deployment

- Build output must be in `docs/` folder (configured in repo settings)
- Push to `main` triggers automatic deployment
- Verify at: https://enghussam23.github.io/
- Include `.nojekyll` file in `docs/` to prevent Jekyll processing

## Key Features Implementation

### Homework Submissions

- Display all homework items (newest first)
- Optional file/text submission via mock form (stored in AsyncStorage)
- Submission status: "Not Submitted", "Submitted", "Graded"

### Materials Viewer

- PDF/DOCX preview using `react-native-webview` (web) or linking
- Download button using `expo-file-system` or browser download
- Filter by subject/grade level

### News with Comments

- Public text comments (no files)
- Comments stored in AsyncStorage (mock backend)
- All students see all comments

### Quizzes

- Available in Homework tab as separate section
- Multiple choice questions with timer
- Submit for grading (mock admin review)
- Show score after "teacher approval"

### Search

- Global search bar in header
- Searches across Homework, Materials, News
- Filters by title, content, tags

### Notifications

- Use `expo-notifications` for web/mobile
- Default: enabled for Homework, Materials, News
- Settings page to toggle notification types

### Offline Support

- Cache all content using AsyncStorage
- Show cached content when offline
- Queue submissions for when online (future enhancement)

## Common Development Tasks

### Adding New Content Type

1. Create JSON file in `/src/data/` with standard schema
2. Add context provider in `/src/context/`
3. Create screen component in `/src/screens/`
4. Add to navigation in `AppNavigator.js`
5. Update search logic in `SearchBar.js`

### Adding UI Component

1. Create in `/src/components/` as functional component
2. Use React Native Paper components for consistency
3. Support both RTL and LTR layouts
4. Add to theme if component has custom styling

### Updating Translations

1. Add keys to both `/src/locales/ar.json` and `/src/locales/en.json`
2. Use `t('key')` from `useTranslation()` hook
3. Test in both languages before committing

### Managing Mock Data

- All data in `/src/data/*.json` follows consistent schema
- IDs must be unique across all items
- Dates in ISO 8601 format
- Bilingual fields use `{ ar: "...", en: "..." }` structure

## Important Notes

- **No Backend**: All data is mock/local until backend integration
- **Public Repository**: Never commit sensitive student data
- **Expo Compatibility**: Ensure all dependencies work with Expo
- **Web-First**: Prioritize web functionality, mobile is secondary for POC
- **Performance**: Keep bundle size small for GitHub Pages hosting
- **Arabic Support**: Always test RTL layout when adding UI components

## Dependencies to Install

```json
{
  "expo": "~52.0.0",
  "react": "18.3.1",
  "react-native": "0.76.5",
  "react-native-paper": "^5.12.3",
  "@react-navigation/native": "^7.0.7",
  "@react-navigation/bottom-tabs": "^7.2.2",
  "react-i18next": "^15.2.4",
  "i18next": "^24.2.0",
  "expo-notifications": "~0.29.13",
  "@react-native-async-storage/async-storage": "2.1.0",
  "react-native-vector-icons": "^10.2.0"
}
```

## Next Steps

1. Initialize Expo project: `npx create-expo-app@latest --template blank`
2. Install dependencies listed above
3. Create folder structure as defined
4. Implement navigation with bottom tabs
5. Add mock data and context providers
6. Build out each screen component
7. Configure i18n with Arabic/English
8. Set up GitHub Pages deployment script
9. Test on web and mobile platforms
