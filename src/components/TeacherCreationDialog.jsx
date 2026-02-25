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
  Paper,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  Chip,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  fetchGrades,
  fetchSectionsByGrade,
  fetchSubjects,
  createTeacherWithAssignments,
} from '../services/api';

const TeacherCreationDialog = ({ open, onClose, onSuccess }) => {
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
    subjectAssignments: [
      {
        subjectId: '',
        grades: [],
      },
    ],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState(null);

  // Data state
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sectionsMap, setSectionsMap] = useState({}); // gradeId -> sections[]
  const [loadingData, setLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [subjectsData, gradesData] = await Promise.all([
        fetchSubjects(),
        fetchGrades(),
      ]);

      setSubjects(subjectsData);
      setGrades(gradesData);

      // Load all sections for all grades
      const sectionsData = {};
      for (const grade of gradesData) {
        const sections = await fetchSectionsByGrade(grade.id);
        sectionsData[grade.id] = sections;
      }
      setSectionsMap(sectionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  // Add new subject assignment block
  const handleAddSubjectAssignment = () => {
    setFormData((prev) => ({
      ...prev,
      subjectAssignments: [
        ...prev.subjectAssignments,
        {
          subjectId: '',
          grades: [],
        },
      ],
    }));
  };

  // Remove subject assignment block
  const handleRemoveSubjectAssignment = (index) => {
    setFormData((prev) => ({
      ...prev,
      subjectAssignments: prev.subjectAssignments.filter((_, i) => i !== index),
    }));
  };

  // Update subject for an assignment block
  const handleSubjectChange = (index, subjectId) => {
    setFormData((prev) => {
      const newAssignments = [...prev.subjectAssignments];
      newAssignments[index] = {
        ...newAssignments[index],
        subjectId,
      };
      return { ...prev, subjectAssignments: newAssignments };
    });
  };

  // Toggle grade selection for a subject
  const handleGradeToggle = (assignmentIndex, gradeId) => {
    setFormData((prev) => {
      const newAssignments = [...prev.subjectAssignments];
      const assignment = newAssignments[assignmentIndex];
      const gradeIndex = assignment.grades.findIndex((g) => g.gradeId === gradeId);

      if (gradeIndex >= 0) {
        // Remove grade
        assignment.grades = assignment.grades.filter((g) => g.gradeId !== gradeId);
      } else {
        // Add grade with all sections selected by default
        const allSections = sectionsMap[gradeId] || [];
        assignment.grades.push({
          gradeId,
          sectionIds: allSections.map((s) => s.id),
        });
      }

      newAssignments[assignmentIndex] = assignment;
      return { ...prev, subjectAssignments: newAssignments };
    });
  };

  // Toggle section selection for a grade
  const handleSectionToggle = (assignmentIndex, gradeId, sectionId) => {
    setFormData((prev) => {
      const newAssignments = [...prev.subjectAssignments];
      const assignment = newAssignments[assignmentIndex];
      const grade = assignment.grades.find((g) => g.gradeId === gradeId);

      if (grade) {
        const sectionIndex = grade.sectionIds.indexOf(sectionId);
        if (sectionIndex >= 0) {
          // Remove section
          grade.sectionIds = grade.sectionIds.filter((id) => id !== sectionId);
        } else {
          // Add section
          grade.sectionIds.push(sectionId);
        }
      }

      newAssignments[assignmentIndex] = assignment;
      return { ...prev, subjectAssignments: newAssignments };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await createTeacherWithAssignments(formData);
      console.log("THE ASSIGNMENT RECEIPT:", result);
      console.log("EMAIL", result.email);

      setSuccess(true);
      setResult(result);

      // Auto-close after 3 seconds if fully successful
      if (result.assignmentsFailed === 0) {
        setTimeout(() => {
          handleClose();
          if (onSuccess) onSuccess();
        }, 2000);
        // Page Reload
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || 'Failed to create teacher');
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
        subjectAssignments: [{ subjectId: '', grades: [] }],
      });
      setError(null);
      setSuccess(false);
      setResult(null);
      onClose();
    }
  };

  const isFormValid = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.firstNameAr ||
      !formData.lastNameAr
    ) {
      return false;
    }

    // Must have at least one subject assignment
    if (formData.subjectAssignments.length === 0) {
      return false;
    }

    // Each assignment must have subject and at least one grade with sections
    for (const assignment of formData.subjectAssignments) {
      if (!assignment.subjectId) return false;
      if (assignment.grades.length === 0) return false;

      // Each grade must have at least one section
      for (const grade of assignment.grades) {
        if (grade.sectionIds.length === 0) return false;
      }
    }

    return true;
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name[lang] || subject.name.en : '';
  };

  const getGradeName = (gradeId) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.name[lang] || grade.name.en : '';
  };

  const isGradeSelected = (assignmentIndex, gradeId) => {
    const assignment = formData.subjectAssignments[assignmentIndex];
    return assignment.grades.some((g) => g.gradeId === gradeId);
  };

  const isSectionSelected = (assignmentIndex, gradeId, sectionId) => {
    const assignment = formData.subjectAssignments[assignmentIndex];
    const grade = assignment.grades.find((g) => g.gradeId === gradeId);
    return grade ? grade.sectionIds.includes(sectionId) : false;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PersonAddIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6">
            {lang === 'ar' ? 'إضافة معلم جديد' : 'Add New Teacher'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && result && (
          <Alert 
            severity={result.assignmentsFailed > 0 ? 'warning' : 'success'} 
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" fontWeight="bold">
              {lang === 'ar' ? '✅ تم إنشاء المعلم بنجاح!' : '✅ Teacher created successfully!'}
            </Typography>
            <Typography variant="body2">
              {lang === 'ar' 
                ? `البريد الإلكتروني: ${result.email}`
                : `Email: ${result.email}`}
            </Typography>
            <Typography variant="body2">
              {lang === 'ar'
                ? `التعيينات الناجحة: ${result.assignmentsCreated}`
                : `Assignments created: ${result.assignmentsCreated}`}
            </Typography>
            {result.assignmentsFailed > 0 && (
              <Typography variant="body2" color="error">
                {lang === 'ar'
                  ? `التعيينات الفاشلة: ${result.assignmentsFailed}`
                  : `Assignments failed: ${result.assignmentsFailed}`}
              </Typography>
            )}
          </Alert>
        )}

        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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

            {/* Subject Assignments */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SchoolIcon color="primary" />
                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
                  {lang === 'ar' ? 'تعيينات المواد والصفوف' : 'Subject & Grade Assignments'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({lang === 'ar' ? 'مطلوب مادة واحدة على الأقل' : 'At least 1 subject required'})
                </Typography>
              </Box>
            </Grid>

            {/* Dynamic Subject Assignment Blocks */}
            {formData.subjectAssignments.map((assignment, assignmentIndex) => (
              <Grid item xs={12} key={assignmentIndex}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {/* Subject Selection */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                    <FormControl fullWidth required disabled={loading}>
                      <InputLabel>
                        {lang === 'ar' 
                          ? `المادة ${assignmentIndex + 1}` 
                          : `Subject ${assignmentIndex + 1}`}
                      </InputLabel>
                      <Select
                        value={assignment.subjectId}
                        onChange={(e) => handleSubjectChange(assignmentIndex, e.target.value)}
                        label={lang === 'ar' ? `المادة ${assignmentIndex + 1}` : `Subject ${assignmentIndex + 1}`}
                      >
                        {subjects.map((subject) => (
                          <MenuItem key={subject.id} value={subject.id}>
                            {subject.icon} {subject.name[lang] || subject.name.en}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {formData.subjectAssignments.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveSubjectAssignment(assignmentIndex)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Grade & Section Selection */}
                  {assignment.subjectId && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {lang === 'ar' 
                          ? 'اختر الصفوف والشعب لهذه المادة:' 
                          : 'Select grades and sections for this subject:'}
                      </Typography>

                      {grades.map((grade) => {
                        const isSelected = isGradeSelected(assignmentIndex, grade.id);
                        const gradeSections = sectionsMap[grade.id] || [];

                        return (
                          <Box key={grade.id} sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleGradeToggle(assignmentIndex, grade.id)}
                                  disabled={loading}
                                />
                              }
                              label={
                                <Typography variant="body2" fontWeight="bold">
                                  {grade.name[lang] || grade.name.en}
                                </Typography>
                              }
                            />

                            {/* Sections for this grade */}
                            {isSelected && (
                              <Box sx={{ ml: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {gradeSections.map((section) => (
                                  <Chip
                                    key={section.id}
                                    label={lang === 'ar' ? `شعبة ${section.name}` : `Section ${section.name}`}
                                    onClick={() =>
                                      handleSectionToggle(assignmentIndex, grade.id, section.id)
                                    }
                                    color={
                                      isSectionSelected(assignmentIndex, grade.id, section.id)
                                        ? 'primary'
                                        : 'default'
                                    }
                                    icon={
                                      isSectionSelected(assignmentIndex, grade.id, section.id) ? (
                                        <CheckCircleIcon />
                                      ) : undefined
                                    }
                                    disabled={loading}
                                    clickable
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}

            {/* Add Subject Button */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddSubjectAssignment}
                disabled={loading}
                fullWidth
              >
                {lang === 'ar' ? 'إضافة مادة أخرى' : 'Add Another Subject'}
              </Button>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 2 }}>
        <Button onClick={handleClose} disabled={loading} variant='outlined'>
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid() || loading || loadingData}
          startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          sx={{gap: 2}}
        >
          {loading
            ? lang === 'ar'
              ? 'جاري الإنشاء...'
              : 'Creating...'
            : lang === 'ar'
            ? 'إضافة معلم'
            : 'Add Teacher'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherCreationDialog;
