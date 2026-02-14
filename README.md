# School Educational Platform 🎓

A modern, responsive educational website for Al-Manakhir Basic School (مدرسة المناخر الأساسية) serving students from KG to 11th grade and Tawjihi. Built with React, Material-UI, and Vite, featuring a professional desktop-first design with full bilingual support (Arabic/English).

**Live Demo:** [https://enghussam23.github.io/](https://enghussam23.github.io/)

## ✨ Features

### User Experience
- **Full-Screen Hero Section**: Dynamic carousel showcasing school activities with 3 rotating images
- **Professional Navigation**: Horizontal navbar with 6 main sections (Home, Exams, Materials, Activities, Vision, About)
- **Grade & Section Selection**: Students select their grade and section on first visit
- **Responsive Design**: Desktop-first layout that adapts to tablets and mobile devices

### Educational Features
- **Homework Management**: View assignments, submit homework, and track grades
- **Educational Materials**: Browse and download PDFs, DOCX files filtered by subject
- **Exam Schedule**: View exam timetables with date, time, and subject details
- **News & Announcements**: Read updates with images and public commenting system
- **Quizzes**: Take timed multiple-choice quizzes with automatic grading

### Technical Features
- **Bilingual Support**: Full Arabic (RTL) and English (LTR) support with language toggle
- **Offline Support**: Content cached for offline viewing using localforage
- **Fast Refresh**: Optimized for development with Vite HMR
- **Image Carousel**: Auto-rotating hero images with smooth transitions

## 🛠️ Technology Stack

### Frontend (This Repository)
- **Framework**: React 18.3.1 (Web only - NOT React Native)
- **UI Library**: Material-UI (MUI) 5.18.0
- **Build Tool**: Vite 5.4.21
- **Routing**: React Router DOM 6.30.3
- **i18n**: react-i18next 15.7.4 / i18next 24.2.3
- **State**: React Context API
- **Storage**: localforage 1.10.0 (offline caching)
- **Deployment**: GitHub Pages (via `/docs/` folder)

### Backend (Separate Repository)
- **Database**: PocketBase (All-in-one backend)
- **Authentication**: PocketBase Auth (built-in)
- **File Storage**: PocketBase Files
- **Real-time**: WebSocket support
- **SDK**: pocketbase 0.26.8

> **Note:** This repository contains frontend code only. The PocketBase backend is maintained in a separate repository.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

The app will be available at `http://localhost:5173/`

### Available Scripts
- \`npm run dev\` - Start Vite dev server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run deploy\` - Build and deploy to GitHub Pages

## 📁 Project Structure

\`\`\`
/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MainLayout.jsx   # App shell with navbar
│   │   ├── NewsCard.jsx     # News display with images
│   │   ├── HomeworkCard.jsx # Homework submissions
│   │   └── ...
│   ├── pages/              # Main page components
│   │   ├── HomePage.jsx    # Hero + news feed
│   │   ├── ExamsPage.jsx   # Exam schedule
│   │   ├── VisionPage.jsx  # School vision & mission
│   │   └── AboutPage.jsx   # School information
│   ├── context/            # React Context providers
│   │   ├── DataContext.jsx # Content & user data
│   │   └── GradeContext.jsx # Grade selection
│   ├── data/               # Mock JSON data
│   │   ├── news.json
│   │   ├── materials.json
│   │   ├── homework.json
│   │   └── quizzes.json
│   └── locales/            # Translation files
│       ├── ar.json         # Arabic
│       └── en.json         # English
├── public/
│   └── images/
│       ├── hero/           # Carousel images
│       └── ...             # Other assets
├── docs/                   # GitHub Pages build output
└── pb_migrations/          # PocketBase schema migrations
\`\`\`

## 🔌 Backend Integration

This project uses **PocketBase** as its backend (separate repository).

### API Service Layer
All backend communication is handled through `src/services/api.js`:

\`\`\`javascript
import { 
  fetchHomework, 
  fetchNews, 
  submitHomework,
  getBilingualValue 
} from './services/api';

// Fetch data
const homework = await fetchHomework('Grade 10');
const news = await fetchNews();

// Submit homework
await submitHomework(homeworkId, studentId, { text: 'Answer...' });
\`\`\`

### Documentation

**For Backend Team:**
- **[BACKEND_SETUP_GUIDE.md](BACKEND_SETUP_GUIDE.md)** - 📖 Complete setup instructions (START HERE!)
- **[BACKEND_CHECKLIST.md](BACKEND_CHECKLIST.md)** - ✅ Quick checklist (print this!)
- **[POCKETBASE_SCHEMA.md](POCKETBASE_SCHEMA.md)** - 📊 Collections schema reference
- **[INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)** - 🧪 Test frontend-backend connection

**For Frontend Developers:**
- **[BACKEND.md](BACKEND.md)** - Backend architecture overview
- **[POCKETBASE_MIGRATION.md](POCKETBASE_MIGRATION.md)** - Migration from JSON to PocketBase
- **[API_REFERENCE.md](API_REFERENCE.md)** - API functions quick reference

## 🎨 Key Pages

1. **Home**: Full-screen hero carousel + news feed
2. **Exams**: Table view of upcoming exams
3. **Materials**: Filterable educational resources
4. **Activities**: School activities and events
5. **Vision**: School mission, vision, and values
6. **About**: School information and contact

## 📊 Data Structure

### Current State
- **Development**: Using mock JSON data in `src/data/` (news, homework, materials, quizzes)
- **Migration in Progress**: Moving to PocketBase backend

### PocketBase Collections

All content follows a consistent bilingual schema:

\`\`\`json
{
  "id": "unique-id",
  "title": { "ar": "العنوان", "en": "Title" },
  "content": { "ar": "المحتوى", "en": "Content" },
  "date": "ISO 8601 timestamp",
  "grade": "Grade 10"
}
\`\`\`

**Core Collections:**
- `users` - Authentication and profiles
- `activities` - Homework, Quizzes, Exams (unified)
- `lessons` - Educational materials with attachments
- `submissions` - Student homework/quiz submissions
- `news` - Announcements and school news
- `comments` - Comments on news items
- `grades` - Grade levels (KG-Tawjihi)
- `subjects` - Academic subjects

See **[POCKETBASE_SCHEMA.md](POCKETBASE_SCHEMA.md)** for complete schema.

## 🌍 Internationalization

- **Arabic (ar)**: Default language, RTL layout
- **English (en)**: Secondary language, LTR layout
- MUI theme automatically handles RTL/LTR switching

## 🚢 Deployment

\`\`\`bash
# Build and deploy to GitHub Pages
npm run deploy

# Commit the built files
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
\`\`\`

## 🖼️ Image Management

Hero carousel images are located in `/public/images/hero/`:
- Auto-rotates every 5 seconds
- Smooth fade transitions
- Currently displays: students_queue.png, students_breakfast.png, students_class_activity_01.png

## 👤 Author

**Eng. Hussam**
- GitHub: [@enghussam23](https://github.com/enghussam23)

---

**School**: Al-Manakhir Basic School (مدرسة المناخر الأساسية)  
**Academic Years**: KG – Grade 11 & Tawjihi
