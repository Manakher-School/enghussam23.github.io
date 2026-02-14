/**
 * EXAMPLE: News Component with PocketBase
 * 
 * This example shows a complete implementation of a news feed
 * using the PocketBase API service with:
 * - Data fetching from PocketBase
 * - Bilingual content support
 * - Image URL handling
 * - Loading and error states
 * - Refresh functionality
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import NewsCard from '../components/NewsCard';

// Import PocketBase API functions
import {
  fetchNews,
  getBilingualValue,
  pb
} from '../services/api';

function NewsTabWithPocketBase() {
  const { t, i18n } = useTranslation();
  
  // State
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load news on mount
  useEffect(() => {
    loadNews();
  }, []);
  
  /**
   * Load news from PocketBase
   */
  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all published news
      const newsData = await fetchNews();
      
      setNews(newsData);
      
      // Cache for offline access
      localStorage.setItem('cached_news', JSON.stringify(newsData));
      
    } catch (err) {
      console.error('Failed to load news:', err);
      setError(err.message);
      
      // Try to load from cache
      const cached = localStorage.getItem('cached_news');
      if (cached) {
        setNews(JSON.parse(cached));
      }
      
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Manually refresh news
   */
  const handleRefresh = () => {
    loadNews();
  };
  
  // Loading state
  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('news.title')}
        </Typography>
        
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('error.loading_news')}: {error}
          {localStorage.getItem('cached_news') && (
            <Typography variant="caption" display="block">
              {t('common.showing_cached_data')}
            </Typography>
          )}
        </Alert>
      )}
      
      {/* Empty State */}
      {news.length === 0 && !loading && (
        <Alert severity="info">
          {t('news.no_news')}
        </Alert>
      )}
      
      {/* News Grid */}
      <Grid container spacing={3}>
        {news.map((item) => {
          // Extract bilingual values
          const title = getBilingualValue(item.title, i18n.language);
          const content = getBilingualValue(item.content, i18n.language);
          
          // Get image URL from PocketBase
          const imageUrl = item.imageUrl; // Already formatted in api.js
          
          return (
            <Grid item xs={12} md={6} key={item.id}>
              <NewsCard
                news={{
                  ...item,
                  // Provide computed values for the card
                  displayTitle: title,
                  displayContent: content,
                  displayImage: imageUrl
                }}
              />
              
              {/* Alternative: Pass bilingual data and let NewsCard handle it */}
              {/* <NewsCard news={item} language={i18n.language} /> */}
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

export default NewsTabWithPocketBase;

/**
 * BONUS: Custom Hook Pattern
 * 
 * For cleaner component code, you can create a custom hook:
 */

// Custom hook for fetching news
export function useNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchNews();
      setNews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadNews();
  }, []);
  
  return { news, loading, error, refresh: loadNews };
}

// Usage in component:
// const { news, loading, error, refresh } = useNews();
