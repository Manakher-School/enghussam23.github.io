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
  Chip,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';
import QuizCard from '../components/QuizCard';
import gradeLabels from '../data/grades.json';

function ExamsPage() {
  const { t, i18n } = useTranslation();
  const { quizzes, submissions } = useData();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const currentLang = i18n.language;

  const getStatus = (quizId) => {
    const submission = (submissions || []).find(s => s.activity_id === quizId);
    if (!submission) return { text: t('homework.notSubmitted'), color: 'default' };
    if (submission.score != null) return { text: `${t('homework.score')}: ${submission.score}%`, color: 'success' };
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
    <Box padding={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('pages.exams.title')}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {t('pages.exams.subtitle')}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' , textAlign:"center"}}>
                {t('pages.exams.columns.title')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' , textAlign:"center"}}>
                {t('pages.exams.columns.subject')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' , textAlign:"center"}}>
                {t('pages.exams.columns.grade')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' , textAlign:"center"}}>
                {t('pages.exams.columns.duration')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' , textAlign:"center"}}>
                {t('pages.exams.columns.date')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' , textAlign:"center"}}>
                {t('pages.exams.columns.status')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((quiz) => {
              const status = getStatus(quiz.id);
              return (
                <TableRow key={quiz.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium" sx={{textAlign:"center"}}>
                      {quiz.title[currentLang]}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{textAlign:"center"}}>
                    {quiz.subject[currentLang]}
                  </TableCell>
                  <TableCell sx={{textAlign:"center"}}>
                    {gradeLabels[quiz.grade]?.[currentLang] || quiz.grade}
                  </TableCell>
                  <TableCell sx={{textAlign:"center"}}>
                    {quiz.duration} {t('common.minutes')}
                  </TableCell>
                  <TableCell sx={{textAlign:"center"}}>
                    {quiz.date ? new Date(quiz.date).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US') : '-'}
                  </TableCell>
                  <TableCell sx={{textAlign:"center"}}>
                    {(() => {
                      const status = getStatus(quiz.id);
                      return <Chip label={status.text} color={status.color} size="small" />;
                    })()}
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
