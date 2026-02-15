import { useState } from 'react';
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
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

  // Get submission for this homework activity
  const submission = getSubmissionForActivity(homework.id);
  const isSubmitted = !!submission;

  const handleSubmit = async () => {
    if (!submissionText.trim()) return;
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      await submitHomework(homework.id, { 
        text: submissionText,
        answers: { text_submission: submissionText } // Backend format
      });
      
      setSubmissionText('');
      setExpanded(false);
      setShowConfetti(true);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to submit homework');
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
              <Box p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2">
                  {submission.submission_text || submission.answers?.text_submission || t('homework.noContent')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  {t('homework.submittedOn')}: {formatDate(submission.created)}
                </Typography>
              </Box>
            ) : (
              <Box>
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
                <Button 
                  variant="contained" 
                  onClick={handleSubmit}
                  disabled={!submissionText.trim() || submitting}
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
