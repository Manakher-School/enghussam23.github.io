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
  IconButton,
  Rating
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import { getSubjectColor } from '../theme/theme';
import Confetti from './Confetti';

function HomeworkCard({ homework }) {
  const { t, i18n } = useTranslation();
  const { submitHomework, rateHomework, userSubmissions } = useData();
  const [expanded, setExpanded] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const currentLang = i18n.language;
  const submission = userSubmissions.find(s => s.homeworkId === homework.id);
  const isSubmitted = !!submission;

  const handleSubmit = () => {
    submitHomework(homework.id, { text: submissionText });
    setSubmissionText('');
    setExpanded(false);
    setShowConfetti(true);
  };

  const handleStarChange = (newValue) => {
    rateHomework(homework.id, newValue);
  };

  const getStatusColor = () => {
    if (!submission) return 'default';
    if (submission.grade) return 'success';
    return 'warning';
  };

  const getStatusText = () => {
    if (!submission) return t('homework.notSubmitted');
    if (submission.grade) return `${t('homework.graded')}: ${submission.grade}`;
    return t('homework.submitted');
  };

  const subjectColor = getSubjectColor(homework.subject[currentLang]);

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Card 
      elevation={2}
      sx={{
        borderTop: `4px solid ${subjectColor.main}`,
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: `"${subjectColor.emoji}"`,
          position: 'absolute',
          top: -12,
          right: 16,
          fontSize: '2rem',
          background: '#fff',
          borderRadius: '50%',
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          animation: 'float 3s ease-in-out infinite',
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3">
            {homework.title[currentLang]}
          </Typography>
          <Chip 
            label={getStatusText()} 
            color={getStatusColor()} 
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {homework.content[currentLang]}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {t('homework.dueDate')}: {new Date(homework.dueDate).toLocaleDateString(currentLang)}
        </Typography>

        {submission && submission.grade && (
          <Box mt={2} p={2} bgcolor="success.light" borderRadius={1}>
            <Typography variant="body2">
              {t('homework.grade')}: <strong>{submission.grade}</strong>
            </Typography>
          </Box>
        )}

        {isSubmitted && (
          <Box mt={2} textAlign="center">
            <Typography variant="caption" display="block" mb={1} color="text.secondary">
              قيّم عملك ⭐
            </Typography>
            <Rating
              value={submission?.stars || 0}
              onChange={(_, newValue) => handleStarChange(newValue)}
              size="large"
              icon={<StarIcon fontSize="inherit" sx={{ color: '#FFB300' }} />}
              emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#E0E0E0' }} />}
            />
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button 
          size="small" 
          onClick={() => setExpanded(!expanded)}
          disabled={isSubmitted && !submission.grade}
          endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />}
        >
          {isSubmitted ? t('homework.yourSubmission') : t('homework.submit')}
        </Button>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {isSubmitted ? (
            <Box p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2">{submission.text}</Typography>
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
              />
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={!submissionText.trim()}
              >
                {t('homework.submit')}
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
