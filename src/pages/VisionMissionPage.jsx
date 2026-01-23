import { Box, Typography, Paper, Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useTranslation } from 'react-i18next';

function VisionMissionPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const vision = currentLang === 'ar' 
    ? 'أن نكون مؤسسة تعليمية رائدة تسعى لتخريج أجيال متميزة علمياً وأخلاقياً، قادرة على مواجهة تحديات العصر والمساهمة الفعالة في بناء المجتمع.'
    : 'To be a leading educational institution that aims to graduate academically and morally distinguished generations, capable of facing the challenges of the times and contributing effectively to building society.';

  const mission = currentLang === 'ar'
    ? 'نلتزم بتقديم تعليم عالي الجودة في بيئة تعليمية محفزة، تعزز من قدرات الطلاب الإبداعية والفكرية، وتنمي لديهم القيم الأخلاقية والمهارات الحياتية اللازمة لتحقيق النجاح في الحياة الأكاديمية والمهنية.'
    : 'We are committed to providing high-quality education in a stimulating learning environment that enhances students\' creative and intellectual abilities, and develops their moral values and life skills necessary to achieve success in academic and professional life.';

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('pages.vision.title')}
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Vision */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', position: 'relative' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <VisibilityIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" component="h2" color="primary">
                {t('pages.vision.visionTitle')}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              {vision}
            </Typography>
          </Paper>
        </Grid>

        {/* Mission */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', position: 'relative' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <TrackChangesIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
              <Typography variant="h4" component="h2" color="secondary">
                {t('pages.vision.missionTitle')}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
              {mission}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default VisionMissionPage;
