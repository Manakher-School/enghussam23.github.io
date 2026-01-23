import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Text,
  Divider,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import CommentSection from "./CommentSection";

const NewsCard = ({ newsItem }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [commentsVisible, setCommentsVisible] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card style={[styles.card, newsItem.important && styles.importantCard]}>
      <Card.Content>
        {newsItem.important && (
          <Chip
            icon="alert"
            style={styles.importantChip}
            textStyle={styles.importantText}
          >
            Important
          </Chip>
        )}

        <Title style={styles.title}>{newsItem.title[language]}</Title>

        <Paragraph style={styles.content}>
          {newsItem.content[language]}
        </Paragraph>

        <View style={styles.metadata}>
          <Chip icon="tag" style={styles.chip}>
            {newsItem.category[language]}
          </Chip>
          <Chip icon="calendar" style={styles.chip}>
            {formatDate(newsItem.publishedAt)}
          </Chip>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          mode={commentsVisible ? "contained" : "outlined"}
          onPress={() => setCommentsVisible(!commentsVisible)}
          icon="comment"
        >
          {t("news.comments")}
        </Button>
      </Card.Actions>

      {commentsVisible && (
        <>
          <Divider />
          <Card.Content>
            <CommentSection newsId={newsItem.id} />
          </Card.Content>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    elevation: 2,
  },
  importantCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF5722",
  },
  importantChip: {
    alignSelf: "flex-start",
    marginBottom: 10,
    backgroundColor: "#FF5722",
  },
  importantText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  content: {
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    marginRight: 5,
  },
});

export default NewsCard;
