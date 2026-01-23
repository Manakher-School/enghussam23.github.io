import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Paragraph,
  Text,
  Avatar,
  Divider,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";

const CommentSection = ({ newsId }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { comments, addComment } = useData();
  const [commentText, setCommentText] = useState("");

  const newsComments = comments[newsId] || [];

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(newsId, commentText);
      setCommentText("");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label={t("news.writeComment")}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleAddComment}
          disabled={!commentText.trim()}
          style={styles.button}
        >
          {t("news.postComment")}
        </Button>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.commentsContainer}>
        {newsComments.length > 0 ? (
          newsComments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Avatar.Icon size={32} icon="account" style={styles.avatar} />
                <View style={styles.commentMeta}>
                  <Text style={styles.authorName}>{comment.author}</Text>
                  <Text style={styles.timestamp}>
                    {formatDate(comment.timestamp)}
                  </Text>
                </View>
              </View>
              <Paragraph style={styles.commentText}>{comment.text}</Paragraph>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("news.noComments")}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    alignSelf: "flex-end",
  },
  divider: {
    marginVertical: 10,
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentCard: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: "#2196F3",
  },
  commentMeta: {
    marginLeft: 10,
    flex: 1,
  },
  authorName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});

export default CommentSection;
