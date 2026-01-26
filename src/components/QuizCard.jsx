import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import { getSubjectColor } from '../theme/theme';
import Confetti from './Confetti';

function QuizCard({ quiz }) {
  const { t, i18n } = useTranslation();
  const { submitQuiz, quizAttempts } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Convert minutes to seconds
  const [showConfetti, setShowConfetti] = useState(false);

  const currentLang = i18n.language;
  const attempt = quizAttempts.find(a => a.quizId === quiz.id);
  const isCompleted = !!attempt;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleStartQuiz = () => {
    setDialogOpen(true);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(quiz.timeLimit * 60);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    submitQuiz(quiz.id, answers);
    setDialogOpen(false);
    setShowConfetti(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const subjectColor = getSubjectColor(quiz.subject[currentLang]);

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
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <QuizIcon color="primary" />
            <Typography variant="h6" component="h3">
              {quiz.title[currentLang]}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            {quiz.description?.[currentLang] || ''}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip 
              label={`${totalQuestions} ${t('common.questions')}`} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`${quiz.timeLimit} ${t('common.minutes')}`} 
              size="small" 
              variant="outlined"
            />
            {isCompleted && attempt.score && (
              <Chip 
                label={`${t('homework.score')}: ${attempt.score}%`} 
                color="success" 
                size="small"
              />
            )}
            {isCompleted && !attempt.score && (
              <Chip 
                label={t('homework.pending')} 
                color="warning" 
                size="small"
              />
            )}
          </Box>
        </CardContent>

        <CardActions>
          {isCompleted ? (
            <Button size="small" disabled>
              {t('homework.submitted')}
            </Button>
          ) : (
            <Button size="small" variant="contained" onClick={handleStartQuiz}>
              {t('homework.startQuiz')}
            </Button>
          )}
        </CardActions>
      </Card>

      {/* Quiz Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => {}} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{quiz.title[currentLang]}</Typography>
            <Chip 
              label={`${t('homework.timeRemaining')}: ${formatTime(timeLeft)}`}
              color="primary"
              size="small"
            />
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Vine Progress */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                🌱 {t('common.question')} {currentQuestionIndex + 1} {t('common.of')} {totalQuestions}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                height: 12, 
                background: '#E8F5E9',
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid #81C784',
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)',
                  transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  borderRadius: 10,
                  position: 'relative',
                  '&::after': {
                    content: '"🌿"',
                    position: 'absolute',
                    right: -8,
                    top: -12,
                    fontSize: '1.5rem',
                  }
                }}
              />
            </Box>
          </Box>
          
          <Typography variant="h6" paragraph>
            {currentQuestion.question[currentLang]}
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option[currentLang]}
                  control={<Radio />}
                  label={option[currentLang]}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
          >
            {t('common.previous')}
          </Button>
          
          <Box display="flex" gap={1}>
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < totalQuestions}
              >
                {t('homework.submitQuiz')}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext}
              >
                {t('common.next')}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default QuizCard;
