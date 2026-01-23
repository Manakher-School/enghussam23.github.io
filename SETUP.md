# Setup Instructions

## Initial Setup

Follow these steps to get the School Educational Platform running:

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Expo and React Native
- React Navigation
- React Native Paper
- i18next for translations
- AsyncStorage for offline support
- And more...

### 2. Create Placeholder Assets

The app needs some basic image assets. Create these files in the `assets/` directory:

- **icon.png** (1024x1024) - App icon
- **splash.png** (1284x2778) - Splash screen
- **adaptive-icon.png** (1024x1024) - Android adaptive icon
- **favicon.png** (48x48) - Web favicon

You can use placeholder images or create your own school branding.

Quick way to create placeholders:
```bash
# Using ImageMagick (if installed)
convert -size 1024x1024 xc:#2196F3 -pointsize 100 -fill white -gravity center -annotate +0+0 "School" assets/icon.png
convert -size 1024x1024 xc:#2196F3 assets/adaptive-icon.png
convert -size 1284x2778 xc:#2196F3 -pointsize 150 -fill white -gravity center -annotate +0+0 "School Platform" assets/splash.png
convert -size 48x48 xc:#2196F3 assets/favicon.png
```

Or use online tools like:
- https://www.canva.com
- https://www.figma.com
- https://pixlr.com

### 3. Run the Development Server

**For Web:**
```bash
npm run web
```

This will:
- Start the Expo development server
- Open the app in your default browser
- Enable hot reloading for development

**For Mobile (via Expo Go):**
```bash
npm start
```

Then scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

### 4. Test the App

1. **Test Language Switching**: The app defaults to Arabic. Add a language switcher if needed.
2. **Test Homework Submission**: Try submitting text for a homework assignment
3. **Test Quiz**: Take a quiz and see the results
4. **Test Materials**: View and "download" materials
5. **Test Comments**: Add comments to news items
6. **Test Search**: Search across all content types
7. **Test Offline**: Disable network and verify cached content works

## Building for Production

### Web Deployment to GitHub Pages

1. Build the web version:
```bash
npm run deploy
```

This creates a production build in the `docs/` folder.

2. Commit and push:
```bash
git add .
git commit -m "Build for GitHub Pages"
git push origin main
```

3. Configure GitHub Pages:
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/docs`
   - Save

4. Wait a few minutes and your site will be live at:
   `https://enghussam23.github.io/`

### Mobile Apps (Future)

For native mobile apps, you'll need:

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```

3. **Configure build:**
```bash
eas build:configure
```

4. **Build for Android:**
```bash
eas build --platform android
```

5. **Build for iOS:**
```bash
eas build --platform ios
```

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Metro bundler cache issues

**Solution:**
```bash
npx expo start -c
```

### Issue: Assets not loading

**Solution:** Ensure all asset files exist in the `assets/` directory with correct names.

### Issue: RTL layout issues

**Solution:** The app uses React Native Paper which handles RTL automatically. If issues persist, check the `I18nManager` configuration in `LanguageContext.js`.

### Issue: GitHub Pages shows blank page

**Solution:**
1. Check that `docs/` folder contains `index.html`
2. Verify `docs/.nojekyll` file exists
3. Check browser console for errors
4. Ensure all asset paths are relative, not absolute

## Development Tips

### Adding New Features

1. **New Screen:**
   - Create component in `src/screens/`
   - Add to navigation in `AppNavigator.js`
   - Add translations in locale files

2. **New Data Type:**
   - Create JSON file in `src/data/`
   - Add to `DataContext.js`
   - Create card component in `src/components/`

3. **Styling:**
   - Use React Native Paper components
   - Customize theme in `src/theme/theme.js`
   - Follow Material Design principles

### Debugging

- **Web:** Use browser DevTools (F12)
- **Mobile:** Shake device to open Expo DevTools
- **Logs:** Run `npx expo start` and check terminal output

### Performance

- Keep bundle size small
- Optimize images (use WebP, compress)
- Use `React.memo` for expensive components
- Implement pagination for large lists

## Environment Variables

For production, you may want to add `.env` file:

```env
API_URL=https://your-backend-api.com
EXPO_PUBLIC_API_KEY=your-api-key
```

Then use in code:
```javascript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Next Steps

1. **Backend Integration:**
   - Replace mock data with real API calls
   - Implement authentication
   - Add admin dashboard

2. **Enhanced Features:**
   - Video materials
   - Real-time notifications
   - Chat functionality
   - Grade tracking
   - Calendar integration

3. **Testing:**
   - Add unit tests with Jest
   - Add E2E tests with Detox
   - Implement CI/CD pipeline

4. **Analytics:**
   - Add Firebase Analytics
   - Track user engagement
   - Monitor performance

## Support

For help:
- Check [Expo Documentation](https://docs.expo.dev/)
- Visit [React Native Paper](https://callstack.github.io/react-native-paper/)
- Read [React Navigation](https://reactnavigation.org/)

---

Good luck with your school platform! 🎓
