import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useGrade } from '../context/GradeContext';

const GradeSelectionDialog = () => {
  const { t, i18n } = useTranslation();
  const { gradeSelection, saveGradeSelection, grades, sections, loading } = useGrade();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const handleSave = () => {
    if (selectedGrade && selectedSection) {
      saveGradeSelection({
        grade: selectedGrade,
        section: selectedSection,
      });
    }
  };

  if (loading) return null;

  const lang = i18n.language;
  const open = !gradeSelection;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6">
            {t('gradeSelection.title')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('gradeSelection.subtitle')}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('gradeSelection.selectGrade')}</InputLabel>
          <Select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            label={t('gradeSelection.selectGrade')}
          >
            {grades.map((grade) => (
              <MenuItem key={grade.id} value={grade.id}>
                {grade.label[lang]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>{t('gradeSelection.selectSection')}</InputLabel>
          <Select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            label={t('gradeSelection.selectSection')}
          >
            {sections.map((section) => (
              <MenuItem key={section} value={section}>
                {t('gradeSelection.section')} {section}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSave}
          variant="contained"
          fullWidth
          disabled={!selectedGrade || !selectedSection}
        >
          {t('gradeSelection.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GradeSelectionDialog;
