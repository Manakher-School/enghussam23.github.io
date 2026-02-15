import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { fetchStudentByName } from '../services/api';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, quickLoginAsStudent, loading, error } = useAuth();
  
  // Login mode: 'student' or 'staff' (teacher/admin)
  const [loginMode, setLoginMode] = useState('student');
  
  // Student login form
  const [studentName, setStudentName] = useState('');
  
  // Staff login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!studentName.trim()) {
      setLoginError(t('login.pleaseEnterName') || 'Please enter your name');
      return;
    }

    try {
      // Find student by name
      const student = await fetchStudentByName(studentName.trim());
      if (!student) {
        setLoginError(t('login.studentNotFound') || 'Student not found. Please check your name.');
        return;
      }
      
      // Login with default password
      await quickLoginAsStudent(student);
    } catch (err) {
      setLoginError(err.message || t('login.loginFailed') || 'Login failed');
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!email || !password) {
      setLoginError(t('login.pleaseEnterCredentials') || 'Please enter email and password');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || t('login.loginFailed') || 'Login failed');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setLoginMode(newMode);
      setLoginError('');
      // Clear form fields when switching modes
      setStudentName('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            borderRadius: 3,
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {t('appName') || 'Manakher School'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('login.welcome') || 'Welcome! Please login to continue'}
            </Typography>
          </Box>

          {/* Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={loginMode}
              exclusive
              onChange={handleModeChange}
              aria-label="login mode"
              size="large"
            >
              <ToggleButton value="student" aria-label="student login">
                <PersonIcon sx={{ mr: 1 }} />
                {t('login.studentLogin') || 'Student'}
              </ToggleButton>
              <ToggleButton value="staff" aria-label="staff login">
                <AdminIcon sx={{ mr: 1 }} />
                {t('login.staffLogin') || 'Teacher / Admin'}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Error Alert */}
          {(loginError || error) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {loginError || error}
            </Alert>
          )}

          {/* Student Login Mode */}
          {loginMode === 'student' && (
            <Box>
              <Typography variant="h6" gutterBottom textAlign="center" mb={2}>
                {t('login.studentLoginTitle') || 'Student Login'}
              </Typography>
              
              <form onSubmit={handleStudentSubmit}>
                <TextField
                  fullWidth
                  label={t('login.enterYourName') || 'Enter Your Full Name'}
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  disabled={loading}
                  placeholder={t('login.namePlaceholder') || 'e.g., Ahmed Mohammed Hassan'}
                  helperText={t('login.nameHelperText') || 'Enter your full name as registered in school'}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t('login.login') || 'Login'
                  )}
                </Button>
              </form>
            </Box>
          )}

          {/* Staff Login Mode (Email/Password) */}
          {loginMode === 'staff' && (
            <Box>
              <Typography variant="h6" gutterBottom textAlign="center" mb={2}>
                {t('login.staffLoginTitle') || 'Teacher / Admin Login'}
              </Typography>
              
              <form onSubmit={handleStaffSubmit}>
                <TextField
                  fullWidth
                  label={t('login.email') || 'Email'}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label={t('login.password') || 'Password'}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t('login.login') || 'Login'
                  )}
                </Button>
              </form>

              {/* Test Credentials Info (Remove in production) */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {t('login.testCredentials') || 'Test Credentials:'}
                </Typography>
                <Typography variant="caption" component="div" color="text.secondary">
                  Teacher: teacher@school.com / teacher123
                </Typography>
                <Typography variant="caption" component="div" color="text.secondary">
                  Admin: admin@school.com / admin123
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
