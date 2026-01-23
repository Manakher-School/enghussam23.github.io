import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Portal,
  Dialog,
  TextInput,
  Text,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { useData } from "../context/DataContext";

const HomeworkCard = ({ homework }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { submissions, submitHomework } = useData();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [submissionText, setSubmissionText] = useState("");

  const submission = submissions[homework.id];
  const isSubmitted = !!submission;

  const handleSubmit = () => {
    submitHomework(homework.id, {
      type: "text",
      content: submissionText,
    });
    setDialogVisible(false);
    setSubmissionText("");
  };

  const getStatusColor = () => {
    if (submission?.status === "graded") return "#4CAF50";
    if (isSubmitted) return "#2196F3";
    return "#FF9800";
  };

  const getStatusText = () => {
    if (submission?.status === "graded") return t("homework.graded");
    if (isSubmitted) return t("homework.submitted");
    return t("homework.notSubmitted");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{homework.title[language]}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor() }]}
              textStyle={styles.statusText}
            >
              {getStatusText()}
            </Chip>
          </View>

          <Paragraph style={styles.content}>
            {homework.content[language]}
          </Paragraph>

          <View style={styles.metadata}>
            <Chip icon="book" style={styles.chip}>
              {homework.subject[language]}
            </Chip>
            <Chip icon="school" style={styles.chip}>
              {t("materials.grade")} {homework.grade}
            </Chip>
          </View>

          <View style={styles.footer}>
            <Text style={styles.dueDate}>
              {t("homework.dueDate")}: {formatDate(homework.dueDate)}
            </Text>
          </View>

          {submission?.status === "graded" && submission.grade && (
            <View style={styles.gradeContainer}>
              <Text style={styles.gradeText}>
                {t("homework.grade")}: {submission.grade}
              </Text>
            </View>
          )}
        </Card.Content>

        <Card.Actions>
          {!isSubmitted && (
            <Button
              mode="contained"
              onPress={() => setDialogVisible(true)}
              icon="upload"
            >
              {t("homework.submit")}
            </Button>
          )}
          {isSubmitted && (
            <Button
              mode="outlined"
              onPress={() => setDialogVisible(true)}
              icon="eye"
            >
              {t("homework.yourSubmission")}
            </Button>
          )}
        </Card.Actions>
      </Card>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>
            {isSubmitted
              ? t("homework.yourSubmission")
              : t("homework.submitText")}
          </Dialog.Title>
          <Dialog.Content>
            {isSubmitted ? (
              <Paragraph>{submission.content}</Paragraph>
            ) : (
              <TextInput
                mode="outlined"
                label={t("homework.submitText")}
                value={submissionText}
                onChangeText={setSubmissionText}
                multiline
                numberOfLines={4}
              />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>
              {t("common.close")}
            </Button>
            {!isSubmitted && (
              <Button onPress={handleSubmit} mode="contained">
                {t("homework.submit")}
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  statusChip: {
    marginLeft: 10,
  },
  statusText: {
    color: "white",
    fontSize: 11,
  },
  content: {
    marginBottom: 10,
    fontSize: 14,
  },
  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    marginRight: 5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 10,
  },
  dueDate: {
    fontSize: 13,
    color: "#666",
  },
  gradeContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E8F5E9",
    borderRadius: 5,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});

export default HomeworkCard;
