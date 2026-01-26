import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Tabs,
  Tab,
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import HomeworkCard from '../components/HomeworkCard';
import QuizCard from '../components/QuizCard';

function ActivitiesPage() {
  const { t } = useTranslation();
  const { homework, quizzes, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState(0); // 0 = Homework, 1 = Quizzes

  const filterItems = (items) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.ar.toLowerCase().includes(query) ||
      item.title.en.toLowerCase().includes(query) ||
      (item.content?.ar || '').toLowerCase().includes(query) ||
      (item.content?.en || '').toLowerCase().includes(query)
    );
  };

  const filteredHomework = filterItems(homework);
  const filteredQuizzes = filterItems(quizzes);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        {t('nav.activities')}
      </Typography>

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

      {/* Sub Tabs */}
      {/* Activities List */}
      {subTab === 0 && (
        <Grid container spacing={3}>
          {filteredHomework.length === 0 ? (
            <Grid item xs={12}>
              <Box 
                textAlign="center" 
                py={8}
                sx={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
                  borderRadius: 4,
                  border: '2px dashed #81C784',
                }}
              >
                <Typography variant="h3" sx={{ fontSize: '4rem', mb: 2 }}>🎉</Typography>
                <Typography variant="h5" color="primary" gutterBottom fontWeight={600}>
                  {searchQuery ? t('search.noResults') : 'لا واجبات اليوم!'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'وقت اللعب والمرح! 🎮'}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredHomework.map(item => (
              <Grid item xs={12} md={6} key={item.id}>
                <HomeworkCard homework={item} />
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Quizzes List */}
      {subTab === 1 && (
        <Grid container spacing={3}>
          {filteredQuizzes.length === 0 ? (
            <Grid item xs={12}>
              <Box 
                textAlign="center" 
                py={8}
                sx={{
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
                  borderRadius: 4,
                  border: '2px dashed #81C784',
                }}
              >
                <Typography variant="h3" sx={{ fontSize: '4rem', mb: 2 }}>⭐</Typography>
                <Typography variant="h5" color="primary" gutterBottom fontWeight={600}>
                  {searchQuery ? t('search.noResults') : 'لا اختبارات الآن!'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'استمتع بيومك! ستكون هناك اختبارات قريباً 📝'}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredQuizzes.map(item => (
              <Grid item xs={12} md={6} key={item.id}>
                <QuizCard quiz={item} />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}

export default ActivitiesPage;