import { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { useData } from '../context/DataContext';

function NewsCard({ news }) {
  const { t, i18n } = useTranslation();
  const { addComment, newsComments } = useData();
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');

  const currentLang = i18n.language;
  const comments = (newsComments || []).filter(c => c.newsId === news.id);

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(news.id, commentText);
      setCommentText('');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card elevation={2}>
      {/* News Image */}
      {news.imageUrl && (
        <CardMedia
          component="img"
          height="300"
          image={news.imageUrl}
          alt={news.title[currentLang]}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h5" component="h2" sx={{ flex: 1 }}>
            {news.title[currentLang]}
          </Typography>
          {news.important && (
            <Chip 
              label={currentLang === 'ar' ? 'هام' : 'Important'} 
              color="error" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          {new Date(news.publishedAt || news.date).toLocaleDateString(currentLang, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>

        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {news.content[currentLang]}
        </Typography>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
      </Collapse>
    </Card>
  );
}

export default NewsCard;
