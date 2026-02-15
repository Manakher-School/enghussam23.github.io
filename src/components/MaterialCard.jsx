import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Slideshow as PptIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSubjectColor } from '../theme/theme';

function MaterialCard({ material }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [expanded, setExpanded] = useState(false);

  // Support both old format (single file) and new format (multiple files)
  const files = material.files || (material.fileUrl ? [{
    name: material.title?.[currentLang] || 'file',
    url: material.fileUrl,
    type: material.fileType
  }] : []);

  const hasMultipleFiles = files.length > 1;

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const handleView = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const getFileTypeColor = (type) => {
    const colors = {
      'pdf': 'error',
      'docx': 'primary',
      'doc': 'primary',
      'pptx': 'warning',
      'ppt': 'warning',
      'xlsx': 'success',
      'xls': 'success',
      'jpg': 'info',
      'jpeg': 'info',
      'png': 'info',
      'gif': 'info',
    };
    return colors[type?.toLowerCase()] || 'default';
  };

  const getFileIcon = (type) => {
    const typeMap = {
      'pdf': <PdfIcon />,
      'docx': <DocIcon />,
      'doc': <DocIcon />,
      'pptx': <PptIcon />,
      'ppt': <PptIcon />,
      'xlsx': <ExcelIcon />,
      'xls': <ExcelIcon />,
      'jpg': <ImageIcon />,
      'jpeg': <ImageIcon />,
      'png': <ImageIcon />,
      'gif': <ImageIcon />,
    };
    return typeMap[type?.toLowerCase()] || <FileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const subjectColor = material.subject?.[currentLang] 
    ? getSubjectColor(material.subject[currentLang])
    : { main: '#ccc', light: '#eee' };

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
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3">
            {material.title?.[currentLang] || material.title}
          </Typography>
          {!hasMultipleFiles && files[0] && (
            <Chip 
              label={files[0].type?.toUpperCase()} 
              color={getFileTypeColor(files[0].type)} 
              size="small"
            />
          )}
          {hasMultipleFiles && (
            <Chip 
              icon={<AttachFileIcon />}
              label={`${files.length} ${t('materials.files') || 'Files'}`}
              color="primary"
              size="small"
            />
          )}
        </Box>

        {/* Description */}
        {material.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {material.description[currentLang] || material.description}
          </Typography>
        )}

        {/* Content preview (HTML content from lessons) */}
        {material.content && !material.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {material.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </Typography>
        )}

        {/* Metadata Chips */}
        <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
          {material.subject && (
            <Chip 
              label={material.subject[currentLang] || material.subject} 
              size="small" 
              sx={{
                backgroundColor: subjectColor.light,
                color: '#fff',
                fontWeight: 600,
              }}
            />
          )}
          {material.grade && (
            <Chip 
              label={`${t('materials.grade') || 'Grade'}: ${material.grade}`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>

        {/* Multiple Files List */}
        {hasMultipleFiles && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                }
              >
                {expanded ? t('materials.hideFiles') : t('materials.showFiles')} ({files.length})
              </Button>
              <Collapse in={expanded}>
                <List dense sx={{ mt: 1 }}>
                  {files.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleView(file.url)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleDownload(file.url)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        mb: 0.5,
                      }}
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={
                          <Box component="span" display="flex" gap={1}>
                            <Chip
                              label={file.type?.toUpperCase()}
                              size="small"
                              color={getFileTypeColor(file.type)}
                              sx={{ height: 18, fontSize: '0.7rem' }}
                            />
                            {file.size && (
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(file.size)}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          </>
        )}

        {/* Upload Date */}
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          {t('common.uploadedOn') || 'Uploaded on'}: {new Date(material.createdAt || material.uploadDate).toLocaleDateString(currentLang)}
        </Typography>
      </CardContent>

      {/* Single File Actions */}
      {!hasMultipleFiles && files[0] && (
        <CardActions>
          <Button 
            size="small" 
            startIcon={<VisibilityIcon />}
            onClick={() => handleView(files[0].url)}
          >
            {t('materials.view') || 'View'}
          </Button>
          <Button 
            size="small" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload(files[0].url)}
          >
            {t('materials.download') || 'Download'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default MaterialCard;
