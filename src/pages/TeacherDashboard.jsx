import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  fetchTeacherClasses,
  fetchClassEnrollments,
  fetchActivities,
  fetchLessons,
  fetchClassSubmissions,
  createActivity,
  createLesson,
  createQuestion,
  deleteActivity,
  deleteLesson,
} from '../services/api';

function TeacherDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Class data
  const [enrollments, setEnrollments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Dialogs
  const [activityDialog, setActivityDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  
  // Form data
  const [newActivity, setNewActivity] = useState({
    title: '',
    type: 'quiz',
    time_limit: 30,
    max_score: 100,
  });
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
  });
  const [newQuestion, setNewQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
  });
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Load teacher's classes on mount
  useEffect(() => {
    loadClasses();
  }, [user]);

  // Load class data when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadClassData();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await fetchTeacherClasses(user.id);
      setClasses(data);
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClassData = async () => {
    try {
      setLoading(true);
      const [enrollmentsData, activitiesData, lessonsData, submissionsData] = await Promise.all([
        fetchClassEnrollments(selectedClass.id),
        fetchActivities([selectedClass.id]),
        fetchLessons([selectedClass.id]),
        fetchClassSubmissions(selectedClass.id),
      ]);
      
      setEnrollments(enrollmentsData);
      setActivities(activitiesData);
      setLessons(lessonsData);
      setSubmissions(submissionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    try {
      await createActivity(selectedClass.id, newActivity);
      setActivityDialog(false);
      setNewActivity({ title: '', type: 'quiz', time_limit: 30, max_score: 100 });
      loadClassData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateLesson = async () => {
    try {
      await createLesson(selectedClass.id, newLesson);
      setLessonDialog(false);
      setNewLesson({ title: '', content: '' });
      loadClassData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      if (!selectedActivity) return;
      await createQuestion(selectedActivity.id, newQuestion);
      setQuestionDialog(false);
      setNewQuestion({ type: 'mcq', question: '', options: ['', '', '', ''], correct_answer: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm(t('teacher.confirmDelete'))) return;
    try {
      await deleteActivity(activityId);
      loadClassData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm(t('teacher.confirmDelete'))) return;
    try {
      await deleteLesson(lessonId);
      loadClassData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && classes.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (classes.length === 0) {
    return (
      <Container>
        <Box textAlign="center" mt={8}>
          <Typography variant="h5" color="text.secondary">
            {t('teacher.noClasses')}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {t('teacher.dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('teacher.welcome')}, {user?.name}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BookIcon color="primary" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{classes.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('teacher.totalClasses')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="success" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{enrollments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('teacher.totalStudents')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="warning" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{activities.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('teacher.totalActivities')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="info" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{submissions.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('teacher.totalSubmissions')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Class Selector */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>{t('teacher.selectClass')}</InputLabel>
            <Select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const cls = classes.find(c => c.id === e.target.value);
                setSelectedClass(cls);
              }}
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.course?.title || t('teacher.untitledClass')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {selectedClass && (
        <Card>
          <CardContent>
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
              <Tab label={t('teacher.students')} />
              <Tab label={t('teacher.activities')} />
              <Tab label={t('teacher.lessons')} />
              <Tab label={t('teacher.submissions')} />
            </Tabs>

            <Box mt={3}>
              {/* Students Tab */}
              {currentTab === 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('teacher.studentName')}</TableCell>
                        <TableCell>{t('teacher.email')}</TableCell>
                        <TableCell>{t('teacher.enrolledDate')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>{enrollment.student?.name || 'N/A'}</TableCell>
                          <TableCell>{enrollment.student?.email || 'N/A'}</TableCell>
                          <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {enrollments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            {t('teacher.noStudents')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Activities Tab */}
              {currentTab === 1 && (
                <>
                  <Box mb={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setActivityDialog(true)}
                    >
                      {t('teacher.createActivity')}
                    </Button>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('teacher.title')}</TableCell>
                          <TableCell>{t('teacher.type')}</TableCell>
                          <TableCell>{t('teacher.timeLimit')}</TableCell>
                          <TableCell>{t('teacher.maxScore')}</TableCell>
                          <TableCell>{t('teacher.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell>{activity.title}</TableCell>
                            <TableCell>
                              <Chip label={activity.type} size="small" />
                            </TableCell>
                            <TableCell>{activity.time_limit || 'N/A'} min</TableCell>
                            <TableCell>{activity.max_score}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedActivity(activity);
                                  setQuestionDialog(true);
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteActivity(activity.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {activities.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              {t('teacher.noActivities')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {/* Lessons Tab */}
              {currentTab === 2 && (
                <>
                  <Box mb={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setLessonDialog(true)}
                    >
                      {t('teacher.createLesson')}
                    </Button>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('teacher.title')}</TableCell>
                          <TableCell>{t('teacher.attachments')}</TableCell>
                          <TableCell>{t('teacher.created')}</TableCell>
                          <TableCell>{t('teacher.actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lessons.map((lesson) => (
                          <TableRow key={lesson.id}>
                            <TableCell>{lesson.title}</TableCell>
                            <TableCell>{lesson.attachments?.length || 0}</TableCell>
                            <TableCell>{new Date(lesson.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        {lessons.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              {t('teacher.noLessons')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {/* Submissions Tab */}
              {currentTab === 3 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('teacher.student')}</TableCell>
                        <TableCell>{t('teacher.activity')}</TableCell>
                        <TableCell>{t('teacher.score')}</TableCell>
                        <TableCell>{t('teacher.submittedAt')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>{submission.student?.name || 'N/A'}</TableCell>
                          <TableCell>{submission.activity?.title || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${submission.score || 0}/${submission.activity?.max_score || 100}`}
                              color={submission.score >= (submission.activity?.max_score * 0.6) ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {submissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            {t('teacher.noSubmissions')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Create Activity Dialog */}
      <Dialog open={activityDialog} onClose={() => setActivityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('teacher.createActivity')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('teacher.activityTitle')}
              fullWidth
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>{t('teacher.type')}</InputLabel>
              <Select
                value={newActivity.type}
                onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
              >
                <MenuItem value="quiz">{t('teacher.quiz')}</MenuItem>
                <MenuItem value="exam">{t('teacher.exam')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('teacher.timeLimit')}
              type="number"
              fullWidth
              value={newActivity.time_limit}
              onChange={(e) => setNewActivity({ ...newActivity, time_limit: parseInt(e.target.value) })}
            />
            <TextField
              label={t('teacher.maxScore')}
              type="number"
              fullWidth
              value={newActivity.max_score}
              onChange={(e) => setNewActivity({ ...newActivity, max_score: parseInt(e.target.value) })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateActivity} variant="contained">{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog open={lessonDialog} onClose={() => setLessonDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('teacher.createLesson')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('teacher.lessonTitle')}
              fullWidth
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
            />
            <TextField
              label={t('teacher.content')}
              fullWidth
              multiline
              rows={6}
              value={newLesson.content}
              onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateLesson} variant="contained">{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={questionDialog} onClose={() => setQuestionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('teacher.addQuestion')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('teacher.questionType')}</InputLabel>
              <Select
                value={newQuestion.type}
                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
              >
                <MenuItem value="mcq">{t('teacher.multipleChoice')}</MenuItem>
                <MenuItem value="tf">{t('teacher.trueFalse')}</MenuItem>
                <MenuItem value="short">{t('teacher.shortAnswer')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('teacher.questionText')}
              fullWidth
              multiline
              rows={3}
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            />
            {newQuestion.type === 'mcq' && (
              <>
                {newQuestion.options.map((option, index) => (
                  <TextField
                    key={index}
                    label={`${t('teacher.option')} ${index + 1}`}
                    fullWidth
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options];
                      newOptions[index] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                  />
                ))}
              </>
            )}
            <TextField
              label={t('teacher.correctAnswer')}
              fullWidth
              value={newQuestion.correct_answer}
              onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateQuestion} variant="contained">{t('common.add')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherDashboard;
