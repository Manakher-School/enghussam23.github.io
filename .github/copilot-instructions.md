# Copilot Instructions for School Educational Platform

## Project Overview

This is a **React web application** (`enghussam23.github.io`) built with **Vite** and **Material-UI (MUI)**, serving as an educational platform for students (KG–11 & Tawjihi). The app is deployed on GitHub Pages.

## Architecture & Technology Stack

- **Framework**: React 18.3.1 (Web only, NOT React Native)
- **Build Tool**: Vite 5.1.0
- **UI Library**: Material-UI (MUI) 5.15.10
- **Routing**: React Router DOM 6.22.0
- **State Management**: React Context API
- **i18n**: react-i18next 24.2.0 (Arabic primary, English secondary)
- **Storage**: localforage 1.10.0 (IndexedDB/localStorage wrapper)
- **Deployment**: GitHub Pages (static build from `/docs/` folder)
- **Data**: Local mock data (JSON structures in `/src/data/`)

## Project Structure

```
/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
├── docs/                       # GitHub Pages build output
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Root component with providers
│   ├── index.css               # Global styles + RTL support
│   ├── i18n.js                 # i18next configuration
│   ├── context/
│   │   ├── GradeContext.jsx    # Grade/section selection state
│   │   └── DataContext.jsx     # Content data & filtering
│   ├── components/
│   │   ├── GradeSelectionDialog.jsx  # First-visit grade selector
│   │   ├── MainLayout.jsx            # App shell with MUI AppBar & Tabs
│   │   ├── HomeworkTab.jsx           # Homework list view
│   │   ├── MaterialsTab.jsx          # Materials list view
│   │   ├── NewsTab.jsx               # News list view
│   │   ├── HomeworkCard.jsx          # Homework display card
│   │   ├── QuizCard.jsx              # Quiz display card
│   │   ├── MaterialCard.jsx          # Material display card
│   │   └── NewsCard.jsx              # News with comments
│   ├── data/
│   │   ├── homework.json       # Mock homework data
│   │   ├── materials.json      # Mock materials data
│   │   ├── news.json           # Mock news data
│   │   └── quizzes.json        # Mock quizzes data
│   ├── locales/
│   │   ├── ar.json             # Arabic translations
│   │   └── en.json             # English translations
│   └── theme/
│       └── theme.js            # MUI theme (RTL support)
└── assets/                     # Images, fonts, icons
```

## Development Conventions

### Code Style

- **Component Names**: PascalCase (e.g., `HomeworkTab`, `MaterialCard`)
- **File Names**: PascalCase for components (.jsx), camelCase for utilities (.js)
- **Hooks**: Use functional components with hooks (no class components)
- **Props**: Destructure in function signature
- **Async Operations**: Use async/await, handle errors with try/catch
- **MUI Components**: Import from `@mui/material` and `@mui/icons-material`

### Data Structure Patterns

All mock data follows consistent schema:

```js
{
  id: "unique-id",
  title: { ar: "العنوان", en: "Title" },
  content: { ar: "المحتوى", en: "Content" },
  date: "ISO 8601 timestamp",
  grade: "Grade 10", // For filtering
  metadata: { /* item-specific fields */ }
}
```

### Navigation

- Single-page app with React Router DOM
- Main navigation: MUI Tabs (Homework, Materials, News)
- Quizzes integrated into Homework tab
- Grade selection dialog on first visit

### Internationalization

- Primary: Arabic (RTL layout via MUI theme direction)
- Secondary: English (LTR layout)
- Use `useTranslation()` hook in all components
- Store all strings in `/src/locales/*.json`
- MUI supports RTL automatically via theme

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Opens on http://localhost:5173/

# Build for production
npm run build

# Preview production build
npm run preview
```

### Building for GitHub Pages

```bash
# Build and deploy
npm run deploy

# This runs: vite build --base=/ && rm -rf docs && mv dist docs && touch docs/.nojekyll
```

### Testing

- **Web**: Test in Chrome, Firefox, Safari
- **Responsive**: Use DevTools responsive mode
- **RTL**: Switch language to Arabic to test layout
- **Offline**: Disable network in DevTools to verify localforage caching

### GitHub Pages Deployment

- Build output must be in `docs/` folder (configured in repo settings)
- Push to `main` triggers automatic deployment
- Verify at: https://enghussam23.github.io/
- `.nojekyll` file prevents Jekyll processing

## Key Features Implementation

### Grade & Section Selection

- Dialog shown on first visit (using `GradeContext`)
- Persisted in localforage: `{ grade: "Grade 10", section: "A" }`
- All content filtered by selected grade
- Can change grade via menu in AppBar

### Homework Submissions

- Display all homework items for selected grade (newest first)
- Text submission stored in localforage
- Submission status: "Not Submitted", "Submitted", "Graded"
- Expandable card shows submission form or submitted content

### Materials Viewer

- MUI Cards with download/view buttons
- Filter by subject using MUI Select
- Search by title/content
- Opens files in new tab (fileUrl from mock data)

### News with Comments

- Public text comments stored in localforage
- MUI List component for comments
- Avatar with initials for each commenter
- Expandable comment section using MUI Collapse

### Quizzes

- MUI Dialog for quiz interface
- Multiple choice with MUI RadioGroup
- Timer display with Chip component
- Linear progress bar shows completion
- Navigate between questions with Previous/Next buttons
- Submit stores attempt in localforage

### Search

- TextField with SearchIcon in each tab
- Searches across title, content, and metadata
- Real-time filtering as user types

### Offline Support

- Cache all content using localforage
- Show cached content when offline
- Queue submissions for when online (future enhancement)

## Common Development Tasks

### Adding New Content Type

1. Create JSON file in `/src/data/` with standard schema
2. Add context provider logic in `DataContext.jsx`
3. Create tab component in `/src/components/`
4. Add tab to `MainLayout.jsx` (MUI Tabs)
5. Update search logic if needed

### Adding UI Component

1. Create in `/src/components/` as functional component (.jsx)
2. Use MUI components for consistency
3. Support both RTL and LTR layouts (MUI handles automatically)
4. Import icons from `@mui/icons-material`

### Updating Translations

1. Add keys to both `/src/locales/ar.json` and `/src/locales/en.json`
2. Use `t('key')` from `useTranslation()` hook
3. Test in both languages before committing

### Managing Mock Data

- All data in `/src/data/*.json` follows consistent schema
- IDs must be unique across all items
- Dates in ISO 8601 format
- Bilingual fields use `{ ar: "...", en: "..." }` structure
- Include `grade` field for filtering (e.g., "Grade 10", "KG", "Tawjihi")

## Important Notes

- **Web Only**: This is NOT React Native - it's standard React for web
- **No Backend**: All data is mock/local until backend integration
- **Public Repository**: Never commit sensitive student data
- **Vite HMR**: Hot Module Replacement works automatically in dev mode
- **Performance**: Keep bundle size small for GitHub Pages hosting
- **Arabic Support**: Always test RTL layout when adding UI components
- **MUI Theming**: Use theme values for colors, spacing, breakpoints

## MUI Best Practices

### Responsive Design

```jsx
import { Box, Grid, useMediaQuery, useTheme } from '@mui/material';

// Use breakpoints
<Grid container spacing={3}>
  <Grid item xs={12} md={6} lg={4}>
    {/* Content */}
  </Grid>
</Grid>

// Use useMediaQuery hook
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
```

### Common MUI Components Used

- `AppBar`, `Toolbar`, `Tabs`, `Tab` - Navigation
- `Card`, `CardContent`, `CardActions` - Content containers
- `TextField`, `Select`, `MenuItem` - Form inputs
- `Button`, `IconButton`, `Chip` - Actions & tags
- `Dialog`, `DialogTitle`, `DialogContent` - Modals
- `List`, `ListItem`, `ListItemText` - Lists
- `Typography` - All text elements
- `Box`, `Container`, `Grid` - Layout
- `CircularProgress`, `LinearProgress` - Loading states

### Theme Customization

Located in `src/theme/theme.js`:

```js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl', // or 'ltr'
  palette: {
    primary: { main: '#2196F3' },
    // ...
  },
  typography: {
    fontFamily: 'Cairo, Roboto, Arial, sans-serif',
  },
});
```

## Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.0",
  "@mui/material": "^5.15.10",
  "@mui/icons-material": "^5.15.10",
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "react-i18next": "^15.2.4",
  "i18next": "^24.2.0",
  "localforage": "^1.10.0"
}
```

## Troubleshooting

### Vite not starting
- Check Node.js version (18+)
- Delete `node_modules` and `package-lock.json`, run `npm install`

### MUI components not rendering
- Ensure `@emotion/react` and `@emotion/styled` are installed
- Check ThemeProvider wraps app in `App.jsx`

### RTL not working
- Verify theme direction is set based on i18n language
- Use MUI's RTL support, don't manually flip CSS

### Build fails
- Check all imports resolve correctly
- Ensure no server-side only code (e.g., Node.js fs module)

## Next Steps for Production

1. Replace mock data with real API calls
2. Add authentication (student login)
3. Implement real file uploads for homework
4. Add admin panel for teachers
5. Set up push notifications
6. Add analytics tracking
7. Optimize images and assets
8. Add error boundary components
9. Implement proper loading states
10. Add unit tests with Vitest

