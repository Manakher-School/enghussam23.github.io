import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import QuizCard from '../components/QuizCard';

function ExamsPage() {
  const { t, i18n } = useTranslation();
  const { quizzes, quizAttempts } = useData();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const currentLang = i18n.language;

  const getStatus = (quizId) => {
    const attempt = quizAttempts.find(a => a.quizId === quizId);
    if (!attempt) return { text: t('homework.notSubmitted'), color: 'default' };
    if (attempt.score) return { text: `${t('homework.score')}: ${attempt.score}%`, color: 'success' };
    return { text: t('homework.pending'), color: 'warning' };
  };

  if (selectedQuiz) {
    return (
      <Box>
        <Button onClick={() => setSelectedQuiz(null)} sx={{ mb: 3 }}>
          {t('common.back')}
        </Button>
        <QuizCard quiz={selectedQuiz} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('pages.exams.title')}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {t('pages.exams.subtitle')}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {t('pages.exams.columns.title')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {t('pages.exams.columns.duration')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {t('pages.exams.columns.status')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                {t('pages.exams.columns.action')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((quiz) => {
              const status = getStatus(quiz.id);
              return (
                <TableRow key={quiz.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {quiz.title[currentLang]}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {quiz.timeLimit} {t('common.minutes')}
                  </TableCell>
                  <TableCell>
                    {quiz.questions.length} {t('common.questions')}
                  </TableCell>
                  <TableCell>
                    <Chip label={status.text} color={status.color} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedQuiz(quiz)}
                      disabled={!!quizAttempts.find(a => a.quizId === quiz.id)}
                    >
                      {quizAttempts.find(a => a.quizId === quiz.id) 
                        ? t('homework.submitted') 
                        : t('homework.startQuiz')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ExamsPage;
