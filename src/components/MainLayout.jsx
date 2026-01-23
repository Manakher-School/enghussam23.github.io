import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Assignment as HomeworkIcon,
  Folder as MaterialsIcon,
  Announcement as NewsIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGrade } from '../context/GradeContext';
import HomeworkTab from './HomeworkTab';
import MaterialsTab from './MaterialsTab';
import NewsTab from './NewsTab';

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const { gradeSelection, clearGradeSelection, grades } = useGrade();
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  if (!gradeSelection) return null;

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChangeGrade = () => {
    clearGradeSelection();
    handleMenuClose();
  };

  const handleChangeLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('lang', newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
    handleMenuClose();
  };

  const lang = i18n.language;
  const gradeLabel = grades.find(g => g.id === gradeSelection.grade)?.label[lang];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('appName')}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {gradeLabel} - {t('gradeSelection.section')} {gradeSelection.section}
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleChangeGrade}>
              {t('menu.changeGrade')}
            </MenuItem>
            <MenuItem onClick={handleChangeLanguage}>
              {t('menu.changeLanguage')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Tab icon={<HomeworkIcon />} label={t('tabs.homework')} />
        <Tab icon={<MaterialsIcon />} label={t('tabs.materials')} />
        <Tab icon={<NewsIcon />} label={t('tabs.news')} />
      </Tabs>

      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        {currentTab === 0 && <HomeworkTab />}
        {currentTab === 1 && <MaterialsTab />}
        {currentTab === 2 && <NewsTab />}
      </Container>
    </Box>
  );
};

export default MainLayout;
