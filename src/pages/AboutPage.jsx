import { Box, Typography, Paper, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useTranslation } from 'react-i18next';

function AboutPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const aboutText = currentLang === 'ar'
    ? 'مدرستنا هي مؤسسة تعليمية متميزة تأسست بهدف تقديم تعليم نوعي يواكب أحدث المعايير التربوية العالمية. نحن نؤمن بأن التعليم هو أساس النهضة والتقدم، ونسعى جاهدين لتوفير بيئة تعليمية شاملة تنمي مهارات الطلاب الأكاديمية والإبداعية والاجتماعية.'
    : 'Our school is a distinguished educational institution established to provide quality education that keeps pace with the latest international educational standards. We believe that education is the foundation of renaissance and progress, and we strive to provide a comprehensive learning environment that develops students\' academic, creative and social skills.';

  const values = currentLang === 'ar' 
    ? [
        { title: 'التميز الأكاديمي', text: 'نسعى للتفوق في جميع المجالات الأكاديمية', icon: SchoolIcon },
        { title: 'بناء الشخصية', text: 'نهتم بتنمية شخصية الطالب المتوازنة', icon: GroupsIcon },
        { title: 'التحصيل والإنجاز', text: 'نحتفي بإنجازات طلابنا ونشجع التفوق', icon: EmojiEventsIcon }
      ]
    : [
        { title: 'Academic Excellence', text: 'We strive for excellence in all academic fields', icon: SchoolIcon },
        { title: 'Character Building', text: 'We care about developing balanced student personalities', icon: GroupsIcon },
        { title: 'Achievement', text: 'We celebrate our students\' achievements and encourage excellence', icon: EmojiEventsIcon }
      ];

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('pages.about.title')}
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        {t('pages.about.subtitle')}
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
          {aboutText}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <Grid item xs={12} md={4} key={index}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Icon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {value.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {value.text}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default AboutPage;
