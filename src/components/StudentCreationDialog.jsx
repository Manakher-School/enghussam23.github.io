import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  fetchGrades,
  fetchSectionsByGrade,
  createStudentWithEnrollment,
} from '../services/api';

const StudentCreationDialog = ({ open, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    firstNameAr: '',
    lastNameAr: '',
    gradeId: '',
    sectionId: '',
    parentPhone: '',
    dateOfBirth: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Data state
  const [grades, setGrades] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);

  // Load grades on mount
  useEffect(() => {
    if (open) {
      loadGrades();
    }
  }, [open]);

  // Load sections when grade changes
  useEffect(() => {
    if (formData.gradeId) {
      loadSections(formData.gradeId);
    } else {
      setSections([]);
      setFormData((prev) => ({ ...prev, sectionId: '' }));
    }
  }, [formData.gradeId]);

  const loadGrades = async () => {
    try {
      setLoadingGrades(true);
      const data = await fetchGrades();
      setGrades(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadSections = async (gradeId) => {
    try {
      setLoadingSections(true);
      const data = await fetchSectionsByGrade(gradeId);
      setSections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await createStudentWithEnrollment(formData);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        firstNameAr: '',
        lastNameAr: '',
        gradeId: '',
        sectionId: '',
        parentPhone: '',
        dateOfBirth: '',
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.firstName &&
      formData.lastName &&
      formData.firstNameAr &&
      formData.lastNameAr &&
      formData.gradeId &&
      formData.sectionId
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonAddIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6">
            {lang === 'ar' ? 'إضافة طالب جديد' : 'Add New Student'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {lang === 'ar' ? 'تم إنشاء الطالب بنجاح!' : 'Student created successfully!'}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Account Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
              {lang === 'ar' ? 'معلومات الحساب' : 'Account Information'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={loading}
              helperText={lang === 'ar' ? 'الحد الأدنى 8 أحرف' : 'Minimum 8 characters'}
            />
          </Grid>

          {/* Personal Information - English */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, mt: 1, fontWeight: 'bold' }}>
              {lang === 'ar' ? 'المعلومات الشخصية (إنجليزي)' : 'Personal Information (English)'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label={lang === 'ar' ? 'الاسم الأول (إنجليزي)' : 'First Name (English)'}
              value={formData.firstName}
              onChange={handleChange('firstName')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label={lang === 'ar' ? 'اسم العائلة (إنجليزي)' : 'Last Name (English)'}
              value={formData.lastName}
              onChange={handleChange('lastName')}
              disabled={loading}
            />
          </Grid>

          {/* Personal Information - Arabic */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, mt: 1, fontWeight: 'bold' }}>
              {lang === 'ar' ? 'المعلومات الشخصية (عربي)' : 'Personal Information (Arabic)'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label={lang === 'ar' ? 'الاسم الأول (عربي)' : 'First Name (Arabic)'}
              value={formData.firstNameAr}
              onChange={handleChange('firstNameAr')}
              disabled={loading}
              dir="rtl"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label={lang === 'ar' ? 'اسم العائلة (عربي)' : 'Last Name (Arabic)'}
              value={formData.lastNameAr}
              onChange={handleChange('lastNameAr')}
              disabled={loading}
              dir="rtl"
            />
          </Grid>

          {/* Enrollment Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1, mt: 1, fontWeight: 'bold' }}>
              <SchoolIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
              {lang === 'ar' ? 'معلومات التسجيل' : 'Enrollment Information'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required disabled={loading || loadingGrades}>
              <InputLabel>{lang === 'ar' ? 'الصف' : 'Grade'}</InputLabel>
              <Select
                value={formData.gradeId}
                onChange={handleChange('gradeId')}
                label={lang === 'ar' ? 'الصف' : 'Grade'}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.id}>
                    {grade.name[lang] || grade.name.en}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl 
              fullWidth 
              required 
              disabled={loading || loadingSections || !formData.gradeId}
            >
              <InputLabel>{lang === 'ar' ? 'الشعبة' : 'Section'}</InputLabel>
              <Select
                value={formData.sectionId}
                onChange={handleChange('sectionId')}
                label={lang === 'ar' ? 'الشعبة' : 'Section'}
              >
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {lang === 'ar' ? `شعبة ${section.name}` : `Section ${section.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {loadingSections && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Grid>

          {/* Optional Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 1, fontStyle: 'italic' }}>
              {lang === 'ar' ? 'معلومات إضافية (اختياري)' : 'Additional Information (Optional)'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={lang === 'ar' ? 'هاتف ولي الأمر' : 'Parent Phone'}
              type="tel"
              value={formData.parentPhone}
              onChange={handleChange('parentPhone')}
              disabled={loading}
              placeholder="+970599123456"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid() || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
        >
          {loading
            ? lang === 'ar'
              ? 'جاري الإنشاء...'
              : 'Creating...'
            : lang === 'ar'
            ? 'إضافة طالب'
            : 'Add Student'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentCreationDialog;
