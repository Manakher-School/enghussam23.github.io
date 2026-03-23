# Setup Instructions

## Initial Setup

Follow these steps to get the School Educational Platform running:

### 1. Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Git**: For version control

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18.3.1
- Material-UI (MUI) 5.18.0
- Vite 5.4.21
- React Router DOM 6.30.3
- react-i18next for translations
- localforage for offline support

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized build in the `/docs/` folder for GitHub Pages deployment.

### 5. Preview Production Build

```bash
npm run preview
```

### 6. Deploy to GitHub Pages

```bash
npm run deploy
```

Then commit and push the `/docs/` folder:

```bash
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

Your site will be live at: `https://[username].github.io/`

This will:
- Start the Expo development server
- Open the app in your default browser
- Enable hot reloading for development

**For Mobile (via Expo Go):**
```bash
npm start
```

## Testing the Application

### 1. Local Testing

After running `npm run dev`, test these features:

1. **Hero Carousel**: Verify images rotate every 5 seconds
2. **Language Switching**: Toggle between Arabic (RTL) and English (LTR)
3. **Navigation**: Test all 6 menu items (Home, Exams, Materials, Activities, Vision, About)
4. **Grade Selection**: Select grade and section on first visit
5. **News Cards**: View news with images and comments
6. **Homework Submission**: Submit text for assignments
7. **Quiz Taking**: Complete a quiz and see results
8. **Materials Download**: View and download educational materials
9. **Search**: Search across content
10. **Offline Support**: Disable network and verify cached content works

### 2. Browser Testing

Test on multiple browsers:
- Chrome/Edge (Chromium-based)
- Firefox
- Safari (if on Mac)

### 3. Responsive Testing

Test on different screen sizes using browser DevTools:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

## Production Deployment

### GitHub Pages Deployment

1. Build and deploy:
```bash
npm run deploy
```

2. Commit and push:
```bash
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

3. Configure GitHub Pages (one-time setup):
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/docs`
   - Save

4. Your site will be live at: `https://enghussam23.github.io/`

## Common Issues & Solutions

### Issue: Images not loading

**Solution:**
- Ensure images are in `/public/images/` directory
- Use correct paths: `/images/filename.png` (not `./images/`)
- Check file names match exactly (case-sensitive)

### Issue: Hero carousel not working

**Solution:**
- Verify all 3 images exist in `/public/images/hero/`
- Check browser console for errors
- Ensure images are properly optimized (< 2MB each recommended)

### Issue: "Module not found" errors

**Solution:**
```bash
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Blank page after deployment

**Solution:**
- Check browser console for errors
- Ensure `/docs/.nojekyll` file exists
- Verify all paths use `/` prefix (not `./`)
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: RTL layout not working

**Solution:**
- MUI theme automatically handles RTL when language is Arabic
- Check `i18n.js` configuration
- Verify MUI theme has `direction: 'rtl'` set correctly

### Issue: Vite HMR errors

**Solution:**
- Ensure component exports are consistent (default vs named)
- Don't mix component and hook exports in same file
- Restart dev server: `npm run dev`

### Issue: Large images slow loading

**Solution:**
- Run the image optimization script: `./scripts/optimize-images.sh`
- Or manually compress images to < 500KB each
- See `/docs/IMAGE_OPTIMIZATION.md` for details

## Development Tips

### Adding New Features

1. **New Page:**
   - Create component in `src/pages/`
   - Add route in `MainLayout.jsx`
   - Add translations in `/src/locales/*.json`
   - Add data file in `/src/data/` if needed

2. **New Data Type:**
   - Create JSON file in `src/data/`
   - Import in `DataContext.jsx`
   - Create card component in `src/components/`
   - Add filtering logic if needed

3. **Styling:**
   - Use MUI components from `@mui/material`
   - Customize theme in `src/theme/theme.js`
   - Use `sx` prop for component-specific styles
   - Follow Material Design principles

### Debugging

- **Browser DevTools:** F12 to open console
- **React DevTools:** Install browser extension
- **Vite Logs:** Check terminal where `npm run dev` is running
- **Network Tab:** Monitor image loading and API calls (future)

### Performance Tips

- Optimize images before committing (use optimization script)
- Use lazy loading for images: `loading="lazy"`
- Keep bundle size small - check with `npm run build`
- Use production build for testing: `npm run preview`

## Image Management

### Adding New Images

1. Place images in `/public/images/` directory
2. Use proper naming: lowercase, no spaces, descriptive
3. Optimize before adding: aim for < 500KB per image
4. Reference with `/images/filename.png` in code

### Hero Carousel Images

Located in `/public/images/hero/`:
- Currently: 3 images rotating every 5 seconds
- Recommended size: 1920x1080px, < 500KB each
- Update images by replacing files with same names

## Next Steps

1. **Content:** Replace mock data with real school content
2. **Backend:** Integrate with actual API (future)
3. **Authentication:** Add student/teacher login system
4. **Analytics:** Add Google Analytics or similar
5. **SEO:** Add meta tags and sitemap
6. **PWA:** Configure service worker for offline-first app

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
