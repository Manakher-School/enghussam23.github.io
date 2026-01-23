import { Box, Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import NewsCard from '../components/NewsCard';

function HomePage() {
  const { t } = useTranslation();
  const { news } = useData();

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('pages.home.title')}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {t('pages.home.subtitle')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {news.map(newsItem => (
          <Grid item xs={12} key={newsItem.id}>
            <NewsCard news={newsItem} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HomePage;
