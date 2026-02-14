/**
 * EXAMPLE: Homework Page with PocketBase Integration
 * 
 * This example shows how to replace local JSON data imports
 * with PocketBase API calls using the new api.js service.
 * 
 * Key Changes:
 * 1. Import API functions instead of JSON files
 * 2. Use useEffect to fetch data on mount
 * 3. Handle loading and error states
 * 4. Support bilingual content from JSON fields
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGrade } from '../context/GradeContext';
import HomeworkCard from '../components/HomeworkCard';

// Import the new API service
import {
  fetchHomework,
  getBilingualValue,
  getCurrentLanguage
} from '../services/api';

function HomeworkPageWithPocketBase() {
  const { t, i18n } = useTranslation();
  const { gradeSelection } = useGrade();
  
  // State management
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch homework data when component mounts or grade changes
  useEffect(() => {
    loadHomework();
  }, [gradeSelection?.grade]); // Re-fetch when grade changes
  
  /**
   * Load homework from PocketBase
   */
  const loadHomework = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch homework filtered by grade (if selected)
      const data = await fetchHomework(gradeSelection?.grade);
      
      setHomework(data);
      
    } catch (err) {
      console.error('Failed to load homework:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('error.loading_homework')}: {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('homework.title')}
      </Typography>
      
      {/* Empty state */}
      {homework.length === 0 && (
        <Alert severity="info">
          {t('homework.no_homework')}
        </Alert>
      )}
      
      {/* Homework list */}
      <Grid container spacing={3}>
        {homework.map((item) => (
          <Grid item xs={12} key={item.id}>
            <HomeworkCard 
              homework={item}
              // Access bilingual fields
              title={getBilingualValue(item.title, i18n.language)}
              content={getBilingualValue(item.content, i18n.language)}
              subject={getBilingualValue(item.subject, i18n.language)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HomeworkPageWithPocketBase;
