import React, { useState } from 'react';
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

        {/* Comments toggle */}
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', color: 'text.secondary' }} onClick={() => setExpanded(!expanded)}>
          <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">
            {t('news.comments')} ({comments.length})
          </Typography>
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              ml: 0.5,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          {/* Comment input */}
          <Box display="flex" gap={1} mb={2}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder={t('news.writeComment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              sx={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
            >
              {t('news.postComment')}
            </Button>
          </Box>

          {/* Comments list */}
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
              {t('news.noComments')}
            </Typography>
          ) : (
            <List dense>
              {comments.map((comment, index) => (
                <React.Fragment key={comment.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start">
                    <Avatar sx={{ width: 32, height: 32, mr: 1, mt: 0.5, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                      {getInitials(comment.author)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight="medium">{comment.author}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.timestamp).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US')}
                          </Typography>
                        </Box>
                      }
                      secondary={comment.text}
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default NewsCard;
