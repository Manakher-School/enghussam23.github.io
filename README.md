# School Educational Platform

A React Native + Expo web application serving as an educational platform for students.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/EngHussam23/enghussam23.github.io.git
cd enghussam23.github.io
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on web:
```bash
npm run web
```

## 📱 Features

### Student Features
- **Homework Tab**: View assignments, submit work (text/files), check grades
- **Materials Tab**: Browse educational materials, view/download PDF/DOCX files
- **News Tab**: Read announcements, post public comments
- **Quizzes**: Take timed quizzes with multiple choice questions
- **Search**: Search across all content types
- **Offline Support**: Cached content available offline
- **Multi-language**: Arabic (primary) and English support
- **Notifications**: Push notifications for new content

## 🏗️ Project Structure

```
/
├── App.js                      # Main entry point
├── package.json                # Dependencies
├── app.json                    # Expo configuration
├── src/
│   ├── navigation/             # Navigation setup
│   ├── screens/                # Main screens (Homework, Materials, News)
│   ├── components/             # Reusable components
│   ├── context/                # State management (Data, Language)
│   ├── data/                   # Mock JSON data
│   ├── services/               # Storage, notifications, cache
│   ├── locales/                # i18n translations (ar, en)
│   └── theme/                  # React Native Paper theme
└── assets/                     # Images, icons, fonts
```

## 🛠️ Technology Stack

- **Framework**: React Native with Expo SDK 52
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: React Context API
- **i18n**: react-i18next
- **Storage**: AsyncStorage
- **Notifications**: expo-notifications

## 📦 Available Scripts

- `npm start` - Start Expo development server
- `npm run web` - Run on web browser
- `npm run android` - Run on Android (requires Expo Go or emulator)
- `npm run ios` - Run on iOS (requires Expo Go or simulator)
- `npm run build:web` - Build for web deployment
- `npm run deploy` - Build and deploy to GitHub Pages

## 🌐 Deployment to GitHub Pages

1. Build the web version:
```bash
npm run deploy
```

2. Commit and push the `docs/` folder:
```bash
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

3. Configure GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/docs`

4. Your site will be available at: `https://enghussam23.github.io/`

## 🎨 Customization

### Adding Mock Data
Edit JSON files in `src/data/`:
- `homework.json` - Homework assignments
- `materials.json` - Educational materials
- `news.json` - News and announcements
- `quizzes.json` - Quiz questions

### Changing Theme
Edit `src/theme/theme.js` to customize colors and styling.

### Adding Translations
Add keys to `src/locales/ar.json` and `src/locales/en.json`.

## 📝 Data Structure

All content follows a consistent bilingual schema:

```javascript
{
  "id": "unique-id",
  "title": { "ar": "العنوان", "en": "Title" },
  "content": { "ar": "المحتوى", "en": "Content" },
  "date": "ISO 8601 timestamp",
  "metadata": { /* item-specific fields */ }
}
```

## 🔧 Development

### Testing
- **Web**: Test in Chrome, Firefox, Safari
- **Mobile**: Use Expo Go app to test on device
- **Offline**: Disable network in DevTools to verify caching
- **RTL**: Switch language to Arabic to test layout

### Debugging
- Use React DevTools browser extension
- Check Expo DevTools in browser when running `npm start`
- View console logs for errors

## 📱 Mobile App (Future)

To build native apps:
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure: `eas build:configure`
3. Build: `eas build --platform android` or `eas build --platform ios`

## 🤝 Contributing

This is a school project. Contributions are welcome via pull requests.

## 📄 License

MIT License - See LICENSE file for details

## 📧 Contact

For questions or support, contact the school administration.

---

**Note**: This is a Proof of Concept (POC) using mock data. Backend integration and admin dashboard will be added in future versions.