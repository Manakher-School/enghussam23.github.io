import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Portal,
  Dialog,
  RadioButton,
  Text,
  ProgressBar,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { useData } from "../context/DataContext";

const QuizCard = ({ quiz }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { quizAttempts, submitQuiz } = useData();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration * 60);
  const [quizStarted, setQuizStarted] = useState(false);

  const attempt = quizAttempts[quiz.id];

  useEffect(() => {
    let timer;
    if (quizStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const handleStartQuiz = () => {
    setDialogVisible(true);
    setQuizStarted(true);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(quiz.duration * 60);
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });

    submitQuiz(quiz.id, answers, score);
    setDialogVisible(false);
    setQuizStarted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentQ = quiz.questions[currentQuestion];
  const progress = (currentQuestion + 1) / quiz.questions.length;

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{quiz.title[language]}</Title>
            {attempt && (
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      attempt.status === "graded" ? "#4CAF50" : "#FF9800",
                  },
                ]}
                textStyle={styles.statusText}
              >
                {attempt.status === "graded"
                  ? `${attempt.score}/${quiz.totalPoints}`
                  : t("homework.pending")}
              </Chip>
            )}
          </View>

          <View style={styles.metadata}>
            <Chip icon="book" style={styles.chip}>
              {quiz.subject[language]}
            </Chip>
            <Chip icon="school" style={styles.chip}>
              {t("materials.grade")} {quiz.grade}
            </Chip>
            <Chip icon="clock" style={styles.chip}>
              {quiz.duration}{" "}
              {t("homework.timeRemaining").split(" ")[1] || "min"}
            </Chip>
            <Chip icon="star" style={styles.chip}>
              {quiz.totalPoints} {t("homework.grade").split(" ")[0] || "pts"}
            </Chip>
          </View>

          <View style={styles.footer}>
            <Text style={styles.dueDate}>
              {t("homework.dueDate")}: {formatDate(quiz.dueDate)}
            </Text>
          </View>
        </Card.Content>

        <Card.Actions>
          {!attempt ? (
            <Button mode="contained" onPress={handleStartQuiz} icon="play">
              {t("homework.startQuiz")}
            </Button>
          ) : (
            <Button mode="outlined" disabled icon="check">
              {attempt.status === "graded"
                ? `${t("homework.score")}: ${attempt.score}/${quiz.totalPoints}`
                : t("homework.pending")}
            </Button>
          )}
        </Card.Actions>
      </Card>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => {}}
          dismissable={false}
          style={styles.dialog}
        >
          <Dialog.Title>{quiz.title[language]}</Dialog.Title>

          <Dialog.Content>
            <View style={styles.quizHeader}>
              <Text style={styles.timeText}>
                {t("homework.timeRemaining")}: {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.progressText}>
                {currentQuestion + 1} / {quiz.questions.length}
              </Text>
            </View>

            <ProgressBar progress={progress} style={styles.progressBar} />

            <View style={styles.questionContainer}>
              <Paragraph style={styles.question}>
                {currentQ.question[language]}
              </Paragraph>

              <RadioButton.Group
                onValueChange={(value) =>
                  handleAnswerSelect(currentQ.id, parseInt(value))
                }
                value={answers[currentQ.id]?.toString()}
              >
                {currentQ.options.map((option, index) => (
                  <View key={index} style={styles.optionRow}>
                    <RadioButton value={index.toString()} />
                    <Text style={styles.optionText}>{option[language]}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            </View>
          </Dialog.Content>

          <Dialog.Actions>
            {currentQuestion > 0 && (
              <Button onPress={() => setCurrentQuestion(currentQuestion - 1)}>
                {t("common.previous")}
              </Button>
            )}
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                onPress={() => setCurrentQuestion(currentQuestion + 1)}
                mode="contained"
              >
                {t("common.next")}
              </Button>
            ) : (
              <Button onPress={handleSubmitQuiz} mode="contained">
                {t("homework.submitQuiz")}
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
  dialog: {
    maxHeight: "80%",
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF5722",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  progressBar: {
    marginBottom: 20,
  },
  questionContainer: {
    marginTop: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  optionText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

export default QuizCard;
