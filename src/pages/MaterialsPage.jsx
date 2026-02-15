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
  MenuItem,
  Alert,
  Chip,
  Button,
  Badge,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/MaterialCard';
import Fuse from 'fuse.js';

function MaterialsPage() {
  const { t, i18n } = useTranslation();
  const { materials, loading, error } = useData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const currentLang = i18n.language;

  // Get unique subjects from materials
  const subjects = useMemo(() => {
    const subjectSet = new Set(materials.map(m => {
      const subject = m.subject?.[currentLang] || m.subject;
      return typeof subject === 'string' ? subject : '';
    }));
    return ['all', ...Array.from(subjectSet).filter(Boolean)];
  }, [materials, currentLang]);

  // Get unique grades from materials
  const grades = useMemo(() => {
    const gradeSet = new Set(materials.map(m => m.grade).filter(Boolean));
    return ['all', ...Array.from(gradeSet)];
  }, [materials]);

  // Get unique file types from materials
  const fileTypes = useMemo(() => {
    const typeSet = new Set();
    materials.forEach(m => {
      if (m.files && Array.isArray(m.files)) {
        m.files.forEach(f => typeSet.add(f.type?.toLowerCase()));
      } else if (m.fileType) {
        typeSet.add(m.fileType.toLowerCase());
      }
    });
    return ['all', ...Array.from(typeSet).filter(Boolean)];
  }, [materials]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(materials, {
    keys: [
      { name: 'title.ar', weight: 3 },
      { name: 'title.en', weight: 3 },
      { name: 'title', weight: 3 }, // For plain strings
      { name: 'subject.ar', weight: 2 },
      { name: 'subject.en', weight: 2 },
      { name: 'subject', weight: 2 }, // For plain strings
      { name: 'description.ar', weight: 1 },
      { name: 'description.en', weight: 1 },
      { name: 'description', weight: 1 }, // For plain strings
      { name: 'content', weight: 1 }, // HTML content from lessons
    ],
    threshold: 0.3,
    includeScore: true
  }), [materials]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (subjectFilter !== 'all') count++;
    if (gradeFilter !== 'all') count++;
    if (fileTypeFilter !== 'all') count++;
    return count;
  }, [subjectFilter, gradeFilter, fileTypeFilter]);

  const clearFilters = () => {
    setSubjectFilter('all');
    setGradeFilter('all');
    setFileTypeFilter('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  const filterAndSortMaterials = () => {
    let filtered = materials;

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(m => {
        const subject = m.subject?.[currentLang] || m.subject;
        return subject === subjectFilter;
      });
    }

    // Filter by grade
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(m => m.grade === gradeFilter);
    }

    // Filter by file type
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(m => {
        if (m.files && Array.isArray(m.files)) {
          return m.files.some(f => f.type?.toLowerCase() === fileTypeFilter);
        } else if (m.fileType) {
          return m.fileType.toLowerCase() === fileTypeFilter;
        }
        return false;
      });
    }

    // Apply search with Fuse.js
    if (searchQuery.trim()) {
      const fuseFiltered = new Fuse(filtered, {
        keys: [
          { name: 'title.ar', weight: 3 },
          { name: 'title.en', weight: 3 },
          { name: 'title', weight: 3 },
          { name: 'subject.ar', weight: 2 },
          { name: 'subject.en', weight: 2 },
          { name: 'subject', weight: 2 },
          { name: 'description.ar', weight: 1 },
          { name: 'description.en', weight: 1 },
          { name: 'description', weight: 1 },
          { name: 'content', weight: 1 },
        ],
        threshold: 0.3
      });
      filtered = fuseFiltered.search(searchQuery).map(result => result.item);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate);
        case 'oldest':
          return new Date(a.createdAt || a.uploadDate) - new Date(b.createdAt || b.uploadDate);
        case 'name-asc':
          const titleA = a.title?.[currentLang] || a.title || '';
          const titleB = b.title?.[currentLang] || b.title || '';
          return titleA.localeCompare(titleB);
        case 'name-desc':
          const titleA2 = a.title?.[currentLang] || a.title || '';
          const titleB2 = b.title?.[currentLang] || b.title || '';
          return titleB2.localeCompare(titleA2);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredMaterials = filterAndSortMaterials();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('error.loadingFailed')}
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box padding={4}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        {t('nav.materials')}
      </Typography>

      {/* Search Bar and Filter Toggle */}
      <Box display="flex" gap={2} mb={2} flexDirection={{ xs: 'column', md: 'row' }}>
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
        
        <Box display="flex" gap={1}>
          <Badge badgeContent={activeFiltersCount} color="primary">
            <Button
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                />
              }
            >
              {t('common.filters') || 'Filters'}
            </Button>
          </Badge>
          
          {(activeFiltersCount > 0 || searchQuery) && (
            <IconButton
              onClick={clearFilters}
              color="error"
              title={t('common.clearFilters') || 'Clear all'}
            >
              <ClearIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Expandable Filter Panel */}
      <Collapse in={showFilters}>
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
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
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('materials.filterByGrade')}</InputLabel>
                <Select
                  value={gradeFilter}
                  label={t('materials.filterByGrade')}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  {grades.map(grade => (
                    <MenuItem key={grade} value={grade}>
                      {grade === 'all' ? t('materials.all') : grade}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('materials.filterByType') || 'File Type'}</InputLabel>
                <Select
                  value={fileTypeFilter}
                  label={t('materials.filterByType') || 'File Type'}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                >
                  {fileTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type === 'all' ? t('materials.all') : type.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('common.sortBy') || 'Sort By'}</InputLabel>
                <Select
                  value={sortBy}
                  label={t('common.sortBy') || 'Sort By'}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">{t('common.newest') || 'Newest First'}</MenuItem>
                  <MenuItem value="oldest">{t('common.oldest') || 'Oldest First'}</MenuItem>
                  <MenuItem value="name-asc">{t('common.nameAsc') || 'Name (A-Z)'}</MenuItem>
                  <MenuItem value="name-desc">{t('common.nameDesc') || 'Name (Z-A)'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {subjectFilter !== 'all' && (
            <Chip
              label={`${t('materials.subject')}: ${subjectFilter}`}
              onDelete={() => setSubjectFilter('all')}
              color="primary"
              size="small"
            />
          )}
          {gradeFilter !== 'all' && (
            <Chip
              label={`${t('materials.grade')}: ${gradeFilter}`}
              onDelete={() => setGradeFilter('all')}
              color="primary"
              size="small"
            />
          )}
          {fileTypeFilter !== 'all' && (
            <Chip
              label={`${t('materials.filterByType') || 'Type'}: ${fileTypeFilter.toUpperCase()}`}
              onDelete={() => setFileTypeFilter('all')}
              color="primary"
              size="small"
            />
          )}
        </Box>
      )}

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredMaterials.length} {t('common.results') || 'results'}
      </Typography>

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
