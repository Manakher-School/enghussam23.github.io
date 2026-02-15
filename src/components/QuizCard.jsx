import { useState, useEffect } from 'react';
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
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import { fetchQuestions } from '../services/api';
import Confetti from './Confetti';

/**
 * QuizCard Component
 * 
 * Fetches questions from separate 'questions' collection.
 * Students never see correct_answer field.
 * Supports MCQ, True/False, and Short Answer questions.
 */
function QuizCard({ quiz }) {
  const { t } = useTranslation();
  const { submitQuiz, getSubmissionForActivity } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Get submission for this quiz
  const submission = getSubmissionForActivity(quiz.id);
  const isCompleted = !!submission;

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Load questions when quiz dialog opens
  const handleStartQuiz = async () => {
    try {
      setLoadingQuestions(true);
      setQuestionsError(null);
      
      // Fetch questions from backend (without correct answers for students)
      const fetchedQuestions = await fetchQuestions(quiz.id, false);
      
      setQuestions(fetchedQuestions);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setTimeLeft(quiz.time_limit ? quiz.time_limit * 60 : null); // Convert minutes to seconds
      setDialogOpen(true);
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestionsError(error.message || 'Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
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

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      await submitQuiz(quiz.id, answers);
      
      setDialogOpen(false);
      setShowConfetti(true);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown effect
  useEffect(() => {
    if (dialogOpen && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [dialogOpen, timeLeft]);

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Card 
        elevation={2}
        sx={{
          borderTop: `4px solid #2196F3`,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <QuizIcon color="primary" />
            <Typography variant="h6" component="h3">
              {quiz.title || t('quiz.untitled')}
            </Typography>
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            {quiz.time_limit && (
              <Chip 
                label={`${quiz.time_limit} ${t('common.minutes')}`} 
                size="small" 
                variant="outlined"
              />
            )}
            {quiz.max_score && (
              <Chip 
                label={`${t('quiz.maxScore')}: ${quiz.max_score}`} 
                size="small" 
                variant="outlined"
              />
            )}
            {isCompleted && submission.score !== undefined && submission.score !== null && (
              <Chip 
                label={`${t('homework.score')}: ${submission.score}/${quiz.max_score || 100}`} 
                color="success" 
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
            <Button 
              size="small" 
              variant="contained" 
              onClick={handleStartQuiz}
              disabled={loadingQuestions}
            >
              {loadingQuestions ? t('common.loading') : t('quiz.start')}
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
            <Typography variant="h6">{quiz.title || t('quiz.untitled')}</Typography>
            {timeLeft !== null && (
              <Chip 
                label={`${t('quiz.timeRemaining')}: ${formatTime(timeLeft)}`}
                color={timeLeft < 60 ? 'error' : 'primary'}
                size="small"
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {questionsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {questionsError}
            </Alert>
          )}
          
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          
          {loadingQuestions ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : totalQuestions === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('quiz.noQuestions')}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Progress Bar */}
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
              
              {/* Question */}
              <Typography variant="h6" paragraph>
                {currentQuestion?.question || ''}
              </Typography>

              {/* Answer Input based on question type */}
              <FormControl component="fieldset" fullWidth>
                {currentQuestion?.type === 'mcq' && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  >
                    {(currentQuestion.options || []).map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                )}
                
                {currentQuestion?.type === 'tf' && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value === 'true')}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label={t('quiz.true')}
                    />
                    <FormControlLabel
                      value="false"
                      control={<Radio />}
                      label={t('quiz.false')}
                    />
                  </RadioGroup>
                )}
                
                {currentQuestion?.type === 'short' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={t('quiz.enterAnswer')}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  />
                )}
              </FormControl>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0 || loadingQuestions || submitting}
          >
            {t('common.previous')}
          </Button>
          
          <Box display="flex" gap={1}>
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleSubmitQuiz}
                disabled={loadingQuestions || submitting || Object.keys(answers).length === 0}
              >
                {submitting ? t('common.loading') : t('quiz.submit')}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={loadingQuestions || submitting}
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
