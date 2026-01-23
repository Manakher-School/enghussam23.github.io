# School Educational Platform 🎓

A responsive educational platform for students (KG–11 & Tawjihi) built with React, Material-UI, and Vite. Features homework management, educational materials, news/announcements, quizzes, and bilingual support (Arabic/English).

**Live Demo:** [https://enghussam23.github.io/](https://enghussam23.github.io/)

## ✨ Features

- **Grade & Section Selection**: Students select their grade and section on first visit
- **Homework Management**: View assignments, submit homework, and track grades
- **Educational Materials**: Browse and download PDFs, DOCX files filtered by subject
- **News & Announcements**: Read updates with public commenting system
- **Quizzes**: Take timed multiple-choice quizzes with automatic grading
- **Bilingual Support**: Full Arabic (RTL) and English (LTR) support
- **Offline Support**: Content cached for offline viewing using localforage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Framework**: React 18.3.1
- **UI Library**: Material-UI (MUI) 5.15.10
- **Build Tool**: Vite 5.1.0
- **Routing**: React Router DOM 6.22.0
- **i18n**: react-i18next 24.2.0
- **Storage**: localforage 1.10.0
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

The app will be available at http://localhost:5173/

### Available Scripts
- \`npm run dev\` - Start Vite dev server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run deploy\` - Build and deploy to GitHub Pages

## 📊 Data Structure

All content follows a consistent bilingual schema with grade filtering.

## 🌍 Internationalization

- **Arabic (ar)**: Default, RTL layout
- **English (en)**: LTR layout

## 🚢 Deployment

\`\`\`bash
npm run deploy
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
\`\`\`

## 👤 Author

**Eng. Hussam**
- GitHub: [@enghussam23](https://github.com/enghussam23)
