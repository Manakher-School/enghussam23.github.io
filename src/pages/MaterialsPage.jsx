import { useState, useMemo } from 'react';
import {
  Box,
  Container,
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
import MaterialCard from '../components/MaterialCard';
import Fuse from 'fuse.js';

function MaterialsPage() {
  const { t, i18n } = useTranslation();
  const { materials, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const currentLang = i18n.language;

  // Get unique subjects from materials
  const subjects = useMemo(() => {
    const subjectSet = new Set(materials.map(m => m.subject?.[currentLang] || ''));
    return ['all', ...Array.from(subjectSet).filter(Boolean)];
  }, [materials, currentLang]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(materials, {
    keys: [
      { name: 'title.ar', weight: 3 },
      { name: 'title.en', weight: 3 },
      { name: 'subject.ar', weight: 2 },
      { name: 'subject.en', weight: 2 },
      { name: 'description.ar', weight: 1 },
      { name: 'description.en', weight: 1 }
    ],
    threshold: 0.3,
    includeScore: true
  }), [materials]);

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by subject first
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(m => m.subject?.[currentLang] === subjectFilter);
    }

    // Then apply fuzzy search if there's a query
    if (searchQuery.trim()) {
      const fuseFiltered = new Fuse(filtered, {
        keys: [
          { name: 'title.ar', weight: 3 },
          { name: 'title.en', weight: 3 },
          { name: 'subject.ar', weight: 2 },
          { name: 'subject.en', weight: 2 },
          { name: 'description.ar', weight: 1 },
          { name: 'description.en', weight: 1 }
        ],
        threshold: 0.3
      });
      return fuseFiltered.search(searchQuery).map(result => result.item);
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
    <Box padding={4}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        {t('nav.materials')}
      </Typography>

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
            <Box 
              textAlign="center" 
              py={8}
              sx={{
                background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
                borderRadius: 4,
                border: '2px dashed #81C784',
              }}
            >
              <Typography variant="h3" sx={{ fontSize: '4rem', mb: 2 }}>🌸</Typography>
              <Typography variant="h5" color="primary" gutterBottom fontWeight={600}>
                {searchQuery || subjectFilter !== 'all' 
                  ? t('search.noResults')
                  : 'حديقة المعرفة في انتظارك! 🌱'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchQuery || subjectFilter !== 'all'
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'ستجد هنا قريباً الكثير من المصادر التعليمية الرائعة'}
              </Typography>
            </Box>
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

export default MaterialsPage;
