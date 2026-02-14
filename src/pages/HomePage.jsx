import { Box, Typography, Grid, Container, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import NewsCard from '../components/NewsCard';
import { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

function HomePage() {
  const { t } = useTranslation();
  const { news } = useData();
  
  const heroImages = [
    '/images/hero/students_queue.png',
    '/images/hero/students_breakfast.png',
    '/images/hero/students_class_activity_01.png',
    '/images/hero/little_students_stairs_queue.jpeg',
    '/images/hero/school_morning_routine.jpeg',
    '/images/hero/teacher_hug_students.jpeg'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero Section - Full Width */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 'calc(60vh)',
          minHeight: '500px',
          backgroundImage: `url(${heroImages[currentImageIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      >
        {/* Scroll Down Arrow */}
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(76, 175, 80, 0.8)',
            color: 'white',
            '&:hover': {
                color: 'rgba(76, 175, 80, 1)',
              backgroundColor: 'rgba(250, 250, 250, 1)',
            },
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': {
                transform: 'translateX(-50%) translateY(0)',
              },
              '40%': {
                transform: 'translateX(-50%) translateY(-10px)',
              },
              '60%': {
                transform: 'translateX(-50%) translateY(-5px)',
              },
            },
          }}
          onClick={() => window.scrollTo({ top: window.innerHeight - 64, behavior: 'smooth' })}
        >
          <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
        </IconButton>
      </Box>

      {/* News Section */}
      <Container sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          {t('pages.home.subtitle')}
        </Typography>

        <Grid container spacing={3}>
          {(news || []).map(newsItem => (
            <Grid item xs={12} key={newsItem.id}>
              <NewsCard news={newsItem} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export default HomePage;
