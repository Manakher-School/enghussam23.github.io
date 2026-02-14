import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';
import { getSubjectColor } from '../theme/theme';

function MaterialCard({ material }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleDownload = () => {
    // In a real app, this would download the file
    window.open(material.fileUrl, '_blank');
  };

  const handleView = () => {
    // In a real app, this would open the file in a viewer
    window.open(material.fileUrl, '_blank');
  };

  const getFileTypeColor = (type) => {
    const colors = {
      'pdf': 'error',
      'docx': 'primary',
      'pptx': 'warning',
      'xlsx': 'success'
    };
    return colors[type] || 'default';
  };

  const subjectColor = getSubjectColor(material.subject[currentLang]);

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderTop: `4px solid ${subjectColor.main}`,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3">
            {material.title[currentLang]}
          </Typography>
          <Chip 
            label={material.fileType.toUpperCase()} 
            color={getFileTypeColor(material.fileType)} 
            size="small"
          />
        </Box>

        {material.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {material.description[currentLang]}
          </Typography>
        )}

        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
          <Chip 
            label={material.subject[currentLang]} 
            size="small" 
            sx={{
              backgroundColor: subjectColor.light,
              color: '#fff',
              fontWeight: 600,
            }}
          />
          <Chip 
            label={`${t('materials.grade')}: ${material.grade}`} 
            size="small" 
            variant="outlined"
          />
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          {t('common.uploadedOn')}: {new Date(material.uploadDate).toLocaleDateString(currentLang)}
        </Typography>
      </CardContent>

      <CardActions>
        <Button 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={handleView}
        >
          {t('materials.view')}
        </Button>
        <Button 
          size="small" 
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          {t('materials.download')}
        </Button>
      </CardActions>
    </Card>
  );
}

export default MaterialCard;
