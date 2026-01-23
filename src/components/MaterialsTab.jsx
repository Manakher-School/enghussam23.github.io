import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import MaterialCard from './MaterialCard';

function MaterialsTab() {
  const { t } = useTranslation();
  const { materials, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Get unique subjects from materials
  const subjects = ['all', ...new Set(materials.map(m => m.subject))];

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(m => m.subject === subjectFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.ar.toLowerCase().includes(query) ||
        m.title.en.toLowerCase().includes(query) ||
        (m.description?.ar || '').toLowerCase().includes(query) ||
        (m.description?.en || '').toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredMaterials = filterMaterials();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box display="flex" gap={2} mb={3} flexDirection={{ xs: 'column', md: 'row' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('materials.filterBySubject')}</InputLabel>
          <Select
            value={subjectFilter}
            label={t('materials.filterBySubject')}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            {subjects.map(subject => (
              <MenuItem key={subject} value={subject}>
                {subject === 'all' ? t('materials.all') : subject}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Materials Grid */}
      <Grid container spacing={3}>
        {filteredMaterials.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {searchQuery || subjectFilter !== 'all' 
                ? t('search.noResults') 
                : t('common.loading')}
            </Typography>
          </Grid>
        ) : (
          filteredMaterials.map(material => (
            <Grid item xs={12} md={6} lg={4} key={material.id}>
              <MaterialCard material={material} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default MaterialsTab;
