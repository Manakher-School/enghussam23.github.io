import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Language as LanguageIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGrade } from '../context/GradeContext';
import HomePage from '../pages/HomePage';
import ExamsPage from '../pages/ExamsPage';
import MaterialsTab from './MaterialsTab';
import HomeworkTab from './HomeworkTab';
import VisionMissionPage from '../pages/VisionMissionPage';
import AboutPage from '../pages/AboutPage';

const MainLayout = () => {
  const { t, i18n } = useTranslation();
  const { gradeSelection, clearGradeSelection } = useGrade();
  const [currentPage, setCurrentPage] = useState('home');
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!gradeSelection) return null;

  const navigationItems = [
    { key: 'home', label: t('nav.home') },
    { key: 'exams', label: t('nav.exams') },
    { key: 'materials', label: t('nav.materials') },
    { key: 'activities', label: t('nav.activities') },
    { key: 'vision', label: t('nav.vision') },
    { key: 'about', label: t('nav.about') }
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
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

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'exams':
        return <ExamsPage />;
      case 'materials':
        return <MaterialsTab />;
      case 'activities':
        return <HomeworkTab />;
      case 'vision':
        return <VisionMissionPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo and School Name */}
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon sx={{ fontSize: 32 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              {t('appName')}
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box display="flex" gap={1}>
              {navigationItems.map((item) => (
                <Button
                  key={item.key}
                  onClick={() => handlePageChange(item.key)}
                  sx={{
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    backgroundColor: currentPage === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    },
                    fontWeight: currentPage === item.key ? 'bold' : 'normal'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Language Toggle */}
            <IconButton color="inherit" onClick={handleLanguageToggle}>
              <LanguageIcon />
            </IconButton>

            {/* Grade/Settings Menu */}
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              size="small"
              sx={{ 
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 2,
                px: 2
              }}
            >
              {gradeSelection.grade} - {gradeSelection.section}
            </Button>

            {/* Mobile Menu Icon */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                edge="end"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleChangeGrade}>
          {t('menu.changeGrade')}
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor={i18n.language === 'ar' ? 'right' : 'left'}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 'bold' }}>
            {t('appName')}
          </Typography>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  selected={currentPage === item.key}
                  onClick={() => handlePageChange(item.key)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {renderPage()}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2026 {t('appName')} - {t('common.allRightsReserved')}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
