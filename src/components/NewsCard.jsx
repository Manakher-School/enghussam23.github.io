import { useState } from 'react';
import {
  Card,
  CardContent,
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
  Avatar
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
  const comments = newsComments.filter(c => c.newsId === news.id);

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
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {news.title[currentLang]}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          {new Date(news.date).toLocaleDateString(currentLang, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>

        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
          {news.content[currentLang]}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.3s'
            }}
          >
            <CommentIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {comments.length} {t('news.comments')}
          </Typography>
        </Box>
      </CardContent>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          {/* Comments List */}
          {comments.length > 0 ? (
            <List sx={{ mb: 2 }}>
              {comments.map((comment, index) => (
                <Box key={index}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {getInitials(comment.userName)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2">
                            {comment.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.date).toLocaleDateString(currentLang)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {comment.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              {t('news.noComments')}
            </Typography>
          )}

          {/* Add Comment Form */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('news.writeComment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button 
              variant="contained" 
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              {t('news.postComment')}
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default NewsCard;
