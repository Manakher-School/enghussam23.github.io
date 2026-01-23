import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import NewsCard from './NewsCard';

function NewsTab() {
  const { t } = useTranslation();
  const { news, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filterNews = () => {
    if (!searchQuery.trim()) return news;
    
    const query = searchQuery.toLowerCase();
    return news.filter(item =>
      item.title.ar.toLowerCase().includes(query) ||
      item.title.en.toLowerCase().includes(query) ||
      item.content.ar.toLowerCase().includes(query) ||
      item.content.en.toLowerCase().includes(query)
    );
  };

  const filteredNews = filterNews();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder={t('search.placeholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* News Grid */}
      <Grid container spacing={3}>
        {filteredNews.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {searchQuery ? t('search.noResults') : t('common.loading')}
            </Typography>
          </Grid>
        ) : (
          filteredNews.map(newsItem => (
            <Grid item xs={12} key={newsItem.id}>
              <NewsCard news={newsItem} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default NewsTab;
