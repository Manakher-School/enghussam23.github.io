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
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';

function HomeworkCard({ homework }) {
  const { t, i18n } = useTranslation();
  const { submitHomework, userSubmissions } = useData();
  const [expanded, setExpanded] = useState(false);
  const [submissionText, setSubmissionText] = useState('');

  const currentLang = i18n.language;
  const submission = userSubmissions.find(s => s.homeworkId === homework.id);
  const isSubmitted = !!submission;

  const handleSubmit = () => {
    submitHomework(homework.id, submissionText);
    setSubmissionText('');
    setExpanded(false);
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

  return (
    <Card elevation={2}>
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
  );
}

export default HomeworkCard;
