import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  TextField,
  Box,
  Collapse,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import Confetti from './Confetti';

/**
 * HomeworkCard Component
 * 
 * NOTE: Backend currently only supports 'quiz' and 'exam' activity types.
 * This component is prepared for when 'homework' type is added to backend.
 * Submissions use backend's submission_text field for text-based homework.
 */
function HomeworkCard({ homework }) {
  const { t } = useTranslation();
  const { submitHomework, getSubmissionForActivity } = useData();
  const [expanded, setExpanded] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // File upload configuration
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  // Get submission for this homework activity
  const submission = getSubmissionForActivity(homework.id);
  const isSubmitted = !!submission;

  // Validate file
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: t('homework.fileTooLarge', { max: '10MB' }) };
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: t('homework.invalidFileType') };
    }
    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };

  // Add files to selection
  const addFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
    } else {
      setSubmitError(null);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && selectedFiles.length === 0) {
      setSubmitError(t('homework.noContent'));
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // Simulate upload progress
      setUploadProgress(10);
      
      await submitHomework(homework.id, { 
        text: submissionText,
        answers: { text_submission: submissionText },
        files: selectedFiles // Pass files to context
      });
      
      setUploadProgress(100);
      setSubmissionText('');
      setSelectedFiles([]);
      setExpanded(false);
      setShowConfetti(true);
      
      // Reset progress after animation
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to submit homework');
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (!submission) return 'default';
    if (submission.score !== undefined && submission.score !== null) return 'success';
    return 'warning';
  };

  const getStatusText = () => {
    if (!submission) return t('homework.notSubmitted');
    if (submission.score !== undefined && submission.score !== null) {
      return `${t('homework.graded')}: ${submission.score}/${homework.max_score || 100}`;
    }
    return t('homework.submitted');
  };

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return t('common.noDate');
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return t('common.noDate');
    }
  };

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Card 
        elevation={2}
        sx={{
          borderTop: `4px solid #4CAF50`,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h3">
              {homework.title || t('homework.untitled')}
            </Typography>
            <Chip 
              label={getStatusText()} 
              color={getStatusColor()} 
              size="small"
            />
          </Box>

          {homework.content && (
            <Typography variant="body2" color="text.secondary" paragraph>
              {homework.content}
            </Typography>
          )}

          {homework.created && (
            <Typography variant="caption" color="text.secondary" display="block">
              {t('homework.createdDate')}: {formatDate(homework.created)}
            </Typography>
          )}

          {submission && submission.score !== undefined && submission.score !== null && (
            <Box mt={2} p={2} bgcolor="success.light" borderRadius={1}>
              <Typography variant="body2">
                {t('homework.score')}: <strong>{submission.score}/{homework.max_score || 100}</strong>
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Button 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            disabled={isSubmitted && submission.score !== null}
            endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />}
          >
            {isSubmitted ? t('homework.yourSubmission') : t('homework.submit')}
          </Button>
        </CardActions>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {submitError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            )}
            
            {isSubmitted ? (
              <Box>
                {/* Submitted text */}
                <Box p={2} bgcolor="grey.100" borderRadius={1} mb={2}>
                  <Typography variant="body2">
                    {submission.submission_text || submission.answers?.text_submission || t('homework.noContent')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    {t('homework.submittedOn')}: {formatDate(submission.created)}
                  </Typography>
                </Box>

                {/* Submitted files (if available in submission data) */}
                {submission.files && submission.files.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('homework.attachedFiles')}
                    </Typography>
                    <List dense>
                      {submission.files.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <InsertDriveFileIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name || file}
                            secondary={file.size ? formatFileSize(file.size) : null}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                {/* Text submission field */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={t('homework.submitText')}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  sx={{ mb: 2 }}
                  disabled={submitting}
                />

                {/* File upload drag-and-drop zone */}
                <Box
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    border: dragActive ? '2px dashed #4CAF50' : '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: dragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    mb: 2,
                    transition: 'all 0.3s'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('homework.dragDropFiles')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('homework.or')} <strong>{t('homework.clickToSelect')}</strong>
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    {t('homework.maxFileSize', { max: '10MB' })}
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </Box>

                {/* Selected files list */}
                {selectedFiles.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('homework.selectedFiles')} ({selectedFiles.length})
                    </Typography>
                    <List dense>
                      {selectedFiles.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <AttachFileIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name}
                            secondary={formatFileSize(file.size)}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => removeFile(index)}
                              disabled={submitting}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Upload progress */}
                {submitting && uploadProgress > 0 && (
                  <Box mb={2}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" color="text.secondary" mt={0.5}>
                      {t('homework.uploading')}: {uploadProgress}%
                    </Typography>
                  </Box>
                )}

                {/* Submit button */}
                <Button 
                  variant="contained" 
                  onClick={handleSubmit}
                  disabled={(!submissionText.trim() && selectedFiles.length === 0) || submitting}
                  startIcon={<AttachFileIcon />}
                >
                  {submitting ? t('common.loading') : t('homework.submit')}
                </Button>
              </Box>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </>
  );
}

export default HomeworkCard;
