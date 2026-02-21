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
  School as SchoolIcon,
  Class as ClassIcon,
  SupervisorAccount as AdminIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  fetchAllUsers,
  fetchAllCourses,
  createUser,
  createCourse,
  createClass,
  updateUser,
  deleteUser,
} from '../services/api';
import StudentCreationDialog from '../components/StudentCreationDialog';
import TeacherCreationDialog from '../components/TeacherCreationDialog';
import UserDeletionDialog from '../components/UserDeletionDialog';

function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user } = useAuth();
  const { courses: classes, loading: contextLoading } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Data fetched locally (not in DataContext)
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Dialogs
  const [userDialog, setUserDialog] = useState(false);
  const [studentDialog, setStudentDialog] = useState(false);
  const [teacherDialog, setTeacherDialog] = useState(false);
  const [courseDialog, setCourseDialog] = useState(false);
  const [classDialog, setClassDialog] = useState(false);
  const [deletionDialog, setDeletionDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Form data
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
    active: true,
  });
  const [newCourse, setNewCourse] = useState({
    code: '',
    nameEn: '',
    nameAr: '',
    description: '',
    icon: 'school',
    color: '#2196F3',
  });
  const [newClass, setNewClass] = useState({
    course_id: '',
    teacher_id: '',
  });

  useEffect(() => {
    let cancelled = false;
    loadData(cancelled);
    return () => { cancelled = true; };
  }, []);

  const loadData = async (cancelled = false) => {
    try {
      setLoading(true);
      const [usersData, coursesData] = await Promise.all([
        fetchAllUsers(),
        fetchAllCourses(),
      ]);

      if (!cancelled) {
        setUsers(usersData);
        setCourses(coursesData);
      }
    } catch (err) {
      // Suppress auto-cancellation errors (e.g. React StrictMode double-mount)
      if (!cancelled && err.message && !err.message.includes('autocancelled') && !err.message.includes('aborted')) {
        setError(err.message);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(newUser);
      setUserDialog(false);
      setNewUser({ email: '', password: '', name: '', role: 'admin', active: true });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await createCourse(newCourse);
      setCourseDialog(false);
      setNewCourse({ code: '', nameEn: '', nameAr: '', description: '', icon: 'school', color: '#2196F3' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateClass = async () => {
    try {
      await createClass(newClass.course_id, newClass.teacher_id);
      setClassDialog(false);
      setNewClass({ course_id: '', teacher_id: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    // Open the new deletion dialog instead of immediate delete
    setUserToDelete(userToDelete);
    setDeletionDialog(true);
  };

  const handleDeletionSuccess = ({ mode, user }) => {
    // Refresh the user list after successful deletion
    loadData();
    // Show success message based on mode
    const message = mode === 'soft' 
      ? t('admin.userDeactivated') 
      : t('admin.userDeleted');
    // You could add a toast notification here if you have one
    console.log(message);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateUser(userId, { active: !currentStatus });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (contextLoading || loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          {t('admin.dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('admin.welcome')}, {user?.name}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{students.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalStudents')}
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
                <SchoolIcon color="success" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{teachers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalTeachers')}
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
                <ClassIcon color="warning" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{classes.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalClasses')}
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
                <AdminIcon color="info" fontSize="large" />
                <Box ml={2}>
                  <Typography variant="h4">{courses.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.totalCourses')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
            <Tab label={t('admin.users')} />
            <Tab label={t('admin.courses')} />
            <Tab label={t('admin.classes')} />
          </Tabs>

          <Box mt={3}>
            {/* Users Tab */}
            {currentTab === 0 && (
              <>
                <Box mb={2} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setStudentDialog(true)}
                    color="primary"
                  >
                    {t('admin.addStudent')}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setTeacherDialog(true)}
                    color="success"
                  >
                    {t('admin.addTeacher')}
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('admin.name')}</TableCell>
                        <TableCell>{t('admin.email')}</TableCell>
                        <TableCell>{t('admin.role')}</TableCell>
                        <TableCell>{t('admin.status')}</TableCell>
                        <TableCell>{t('admin.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={u.role} 
                              size="small"
                              color={u.role === 'admin' ? 'error' : u.role === 'teacher' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.active ? t('admin.active') : t('admin.inactive')}
                              size="small"
                              color={u.active ? 'success' : 'default'}
                              onClick={() => handleToggleUserStatus(u.id, u.active)}
                              clickable
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === user.id}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Courses Tab */}
            {currentTab === 1 && (
              <>
                <Box mb={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCourseDialog(true)}
                  >
                    {t('admin.createCourse')}
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('admin.title')}</TableCell>
                        <TableCell>{t('admin.description')}</TableCell>
                        <TableCell>{t('admin.created')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.name?.[lang] || course.name?.en || ''}</TableCell>
                          <TableCell>{course.description}</TableCell>
                          <TableCell>{new Date(course.created).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {courses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            {t('admin.noCourses')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {/* Classes Tab */}
            {currentTab === 2 && (
              <>
                <Box mb={2}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setClassDialog(true)}
                  >
                    {t('admin.createClass')}
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('admin.course')}</TableCell>
                        <TableCell>{t('admin.teacher')}</TableCell>
                        <TableCell>{t('admin.created')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.course?.name?.[lang] || cls.course?.name?.en || 'N/A'}</TableCell>
                          <TableCell>{cls.teacher?.name || 'N/A'}</TableCell>
                          <TableCell>{new Date(cls.created).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {classes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            {t('admin.noClasses')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.createAdmin') || 'Create Admin'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('admin.name')}
              fullWidth
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <TextField
              label={t('admin.email')}
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <TextField
              label={t('admin.password')}
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateUser} variant="contained">{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog open={courseDialog} onClose={() => setCourseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.createCourse')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('admin.courseCode')}
              fullWidth
              required
              placeholder="e.g., MATH, SCI, ENG"
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
              helperText={t('admin.courseCodeHelp')}
            />
            <TextField
              label={t('admin.nameEnglish')}
              fullWidth
              required
              placeholder="e.g., Mathematics"
              value={newCourse.nameEn}
              onChange={(e) => setNewCourse({ ...newCourse, nameEn: e.target.value })}
            />
            <TextField
              label={t('admin.nameArabic')}
              fullWidth
              required
              placeholder="مثال: رياضيات"
              value={newCourse.nameAr}
              onChange={(e) => setNewCourse({ ...newCourse, nameAr: e.target.value })}
            />
            <TextField
              label={t('admin.description')}
              fullWidth
              multiline
              rows={3}
              placeholder={t('admin.descriptionOptional')}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
            <TextField
              label={t('admin.icon')}
              fullWidth
              placeholder="e.g., calculate, science, book"
              value={newCourse.icon}
              onChange={(e) => setNewCourse({ ...newCourse, icon: e.target.value })}
              helperText={t('admin.iconHelp')}
            />
            <TextField
              label={t('admin.color')}
              fullWidth
              type="color"
              value={newCourse.color}
              onChange={(e) => setNewCourse({ ...newCourse, color: e.target.value })}
              helperText={t('admin.colorHelp')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateCourse} variant="contained">{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* Create Class Dialog */}
      <Dialog open={classDialog} onClose={() => setClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.createClass')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('admin.course')}</InputLabel>
              <Select
                value={newClass.course_id}
                onChange={(e) => setNewClass({ ...newClass, course_id: e.target.value })}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name?.[lang] || course.name?.en || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('admin.teacher')}</InputLabel>
              <Select
                value={newClass.teacher_id}
                onChange={(e) => setNewClass({ ...newClass, teacher_id: e.target.value })}
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleCreateClass} variant="contained">{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* New Student Creation Dialog */}
      <StudentCreationDialog
        open={studentDialog}
        onClose={() => setStudentDialog(false)}
        onSuccess={() => {
          setStudentDialog(false);
          loadData();
        }}
      />

      {/* Teacher Creation Dialog */}
      <TeacherCreationDialog
        open={teacherDialog}
        onClose={() => setTeacherDialog(false)}
        onSuccess={() => {
          setTeacherDialog(false);
          loadData();
        }}
      />

      {/* User Deletion Dialog */}
      <UserDeletionDialog
        open={deletionDialog}
        onClose={() => {
          setDeletionDialog(false);
          setUserToDelete(null);
        }}
        user={userToDelete}
        onSuccess={handleDeletionSuccess}
      />
    </Container>
  );
}

export default AdminDashboard;
