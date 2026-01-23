import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import {
  Searchbar,
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Portal,
  Dialog,
  TextInput,
  Divider,
  SegmentedButtons,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useData } from "../context/DataContext";
import HomeworkCard from "../components/HomeworkCard";
import QuizCard from "../components/QuizCard";

const HomeworkScreen = () => {
  const { t } = useTranslation();
  const { homework, quizzes, loading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("homework");

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, would fetch new data here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredHomework = homework.filter((item) => {
    const titleMatch =
      item.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch =
      item.content.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.en.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  const filteredQuizzes = quizzes.filter((item) => {
    const titleMatch =
      item.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t("search.placeholder")}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        buttons={[
          {
            value: "homework",
            label: t("homework.title"),
            icon: "book-open-page-variant",
          },
          {
            value: "quizzes",
            label: t("homework.quizzes"),
            icon: "clipboard-check",
          },
        ]}
        style={styles.segmentedButtons}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === "homework" ? (
          filteredHomework.length > 0 ? (
            filteredHomework.map((item) => (
              <HomeworkCard key={item.id} homework={item} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Paragraph>{t("search.noResults")}</Paragraph>
              </Card.Content>
            </Card>
          )
        ) : filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((item) => <QuizCard key={item.id} quiz={item} />)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph>{t("search.noResults")}</Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    elevation: 0,
  },
  segmentedButtons: {
    margin: 10,
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 10,
  },
});

export default HomeworkScreen;
