import { useState } from 'react';
import {
  Box,
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
import HomeworkCard from './HomeworkCard';
import QuizCard from './QuizCard';

function HomeworkTab() {
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

      {/* Sub Tabs */}
      <Tabs 
        value={subTab} 
        onChange={(e, newValue) => setSubTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('homework.title')} />
        <Tab label={t('homework.quizzes')} />
      </Tabs>

      {/* Homework List */}
      {subTab === 0 && (
        <Grid container spacing={3}>
          {filteredHomework.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {searchQuery ? t('search.noResults') : t('common.loading')}
              </Typography>
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
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {searchQuery ? t('search.noResults') : t('common.loading')}
              </Typography>
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

export default HomeworkTab;
