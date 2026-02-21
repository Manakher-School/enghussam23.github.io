import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  PersonOff as PersonOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  getUserDependencies,
  softDeleteUser,
  hardDeleteUser,
  reassignClasses,
  fetchAllUsers,
} from '../services/api';

const UserDeletionDialog = ({ open, onClose, user, onSuccess }) => {
  const { t } = useTranslation();

  // UI state
  const [loading, setLoading] = useState(false);
  const [fetchingDeps, setFetchingDeps] = useState(false);
  const [error, setError] = useState(null);
  
  // Data state
  const [dependencies, setDependencies] = useState(null);
  const [deletionMode, setDeletionMode] = useState('soft'); // 'soft' or 'hard'
  const [confirmText, setConfirmText] = useState('');
  const [showReassignment, setShowReassignment] = useState(false);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [classReassignments, setClassReassignments] = useState({}); // classId -> newTeacherId

  // Load dependencies when dialog opens
  useEffect(() => {
    if (open && user) {
      loadDependencies();
      if (user.role === 'teacher') {
        loadAvailableTeachers();
      }
    } else {
      // Reset state when dialog closes
      setDependencies(null);
      setDeletionMode('soft');
      setConfirmText('');
      setShowReassignment(false);
      setClassReassignments({});
      setError(null);
    }
  }, [open, user]);

  const loadDependencies = async () => {
    try {
      setFetchingDeps(true);
      setError(null);
      const deps = await getUserDependencies(user.id);
      setDependencies(deps);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingDeps(false);
    }
  };

  const loadAvailableTeachers = async () => {
    try {
      const users = await fetchAllUsers();
      const teachers = users.filter(
        (u) => u.role === 'teacher' && u.id !== user.id && u.active
      );
      setAvailableTeachers(teachers);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      if (deletionMode === 'soft') {
        // Soft delete with optional class reassignment
        if (showReassignment && Object.keys(classReassignments).length > 0) {
          // Reassign classes first
          const reassignmentsByTeacher = {};
          for (const [classId, newTeacherId] of Object.entries(classReassignments)) {
            if (!reassignmentsByTeacher[newTeacherId]) {
              reassignmentsByTeacher[newTeacherId] = [];
            }
            reassignmentsByTeacher[newTeacherId].push(classId);
          }

          for (const [newTeacherId, classIds] of Object.entries(reassignmentsByTeacher)) {
            await reassignClasses(user.id, newTeacherId, classIds);
          }
        }

        // Then soft delete the user
        await softDeleteUser(user.id);
        onSuccess?.({ mode: 'soft', user });
        onClose();
      } else {
        // Hard delete - requires confirmation
        if (confirmText !== 'DELETE') {
          setError(t('admin.deleteConfirmError'));
          return;
        }

        await hardDeleteUser(user.id);
        onSuccess?.({ mode: 'hard', user });
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClassReassignment = (classId, newTeacherId) => {
    setClassReassignments((prev) => ({
      ...prev,
      [classId]: newTeacherId,
    }));
  };

  const isFormValid = () => {
    if (deletionMode === 'soft') {
      // Soft delete is always valid
      // Reassignment is optional
      return true;
    } else {
      // Hard delete requires typing DELETE
      return confirmText === 'DELETE';
    }
  };

  const renderDependenciesSummary = () => {
    if (!dependencies) return null;

    const deps = dependencies.dependencies || {};
    const items = Object.entries(deps)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => ({
        key,
        label: t(`admin.dependency.${key}`, key),
        count,
      }));

    if (items.length === 0) {
      return (
        <Alert severity="success" sx={{ mt: 2 }}>
          {t('admin.noDependencies')}
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('admin.thisDependenciesTitle', { role: t(`roles.${user.role}`) })}
        </Typography>
        <List dense>
          {items.map((item) => (
            <ListItem key={item.key}>
              <ListItemText
                primary={`${item.count} ${item.label}`}
              />
            </ListItem>
          ))}
        </List>
        {dependencies.total_impact > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('admin.totalImpact')}: <strong>{dependencies.total_impact}</strong> {t('admin.records')}
          </Typography>
        )}
      </Box>
    );
  };

  const renderClassReassignment = () => {
    if (user.role !== 'teacher' || !dependencies?.dependencies?.classes) {
      return null;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            p: 1,
            borderRadius: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
          onClick={() => setShowReassignment(!showReassignment)}
        >
          <Typography variant="subtitle2">
            {t('admin.reassignClasses')} ({dependencies.dependencies.classes})
          </Typography>
          <IconButton size="small">
            {showReassignment ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={showReassignment}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('admin.reassignmentNote')}
            </Alert>
            {/* Note: We'd need to fetch actual class details to show here */}
            <Typography variant="body2" color="text.secondary">
              {t('admin.reassignmentInstructions')}
            </Typography>
            {/* TODO: Add actual class selection UI when we have class details */}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h6">
            {t('admin.deleteUser')}: {user?.name || user?.email}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {fetchingDeps ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {renderDependenciesSummary()}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('admin.deletionOptions')}
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={deletionMode}
                  onChange={(e) => setDeletionMode(e.target.value)}
                >
                  {/* Soft Delete Option */}
                  <Box
                    sx={{
                      border: 1,
                      borderColor: deletionMode === 'soft' ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      p: 2,
                      mb: 2,
                      bgcolor: deletionMode === 'soft' ? 'action.selected' : 'transparent',
                    }}
                  >
                    <FormControlLabel
                      value="soft"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonOffIcon fontSize="small" />
                            {t('admin.deactivateRecommended')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            {t('admin.deactivateDescription')}
                          </Typography>
                        </Box>
                      }
                    />
                    {deletionMode === 'soft' && renderClassReassignment()}
                  </Box>

                  {/* Hard Delete Option */}
                  <Box
                    sx={{
                      border: 1,
                      borderColor: deletionMode === 'hard' ? 'error.main' : 'divider',
                      borderRadius: 1,
                      p: 2,
                      bgcolor: deletionMode === 'hard' ? 'error.lighter' : 'transparent',
                    }}
                  >
                    <FormControlLabel
                      value="hard"
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DeleteIcon fontSize="small" />
                            {t('admin.permanentlyDelete')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            {t('admin.hardDeleteDescription')}
                          </Typography>
                        </Box>
                      }
                    />
                    {deletionMode === 'hard' && (
                      <Box sx={{ ml: 4, mt: 2 }}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {t('admin.hardDeleteWarning')}
                        </Alert>
                        <TextField
                          label={t('admin.typeDeleteToConfirm')}
                          fullWidth
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="DELETE"
                          helperText={t('admin.typeDeleteHelper')}
                          error={confirmText.length > 0 && confirmText !== 'DELETE'}
                        />
                      </Box>
                    )}
                  </Box>
                </RadioGroup>
              </FormControl>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color={deletionMode === 'soft' ? 'primary' : 'error'}
          disabled={loading || fetchingDeps || !isFormValid()}
          startIcon={loading ? <CircularProgress size={20} /> : deletionMode === 'soft' ? <PersonOffIcon /> : <DeleteIcon />}
        >
          {loading
            ? t('common.processing')
            : deletionMode === 'soft'
            ? t('admin.deactivateUser')
            : t('admin.permanentlyDeleteUser')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDeletionDialog;
