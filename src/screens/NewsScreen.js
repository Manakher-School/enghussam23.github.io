import React, { useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Searchbar, Card, Paragraph } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useData } from "../context/DataContext";
import NewsCard from "../components/NewsCard";

const NewsScreen = () => {
  const { t } = useTranslation();
  const { news, loading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredNews = news.filter((item) => {
    const titleMatch =
      item.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch =
      item.content.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.en.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || contentMatch;
  });

  // Sort by date (newest first)
  const sortedNews = [...filteredNews].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

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

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedNews.length > 0 ? (
          sortedNews.map((item) => <NewsCard key={item.id} newsItem={item} />)
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
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 10,
  },
});

export default NewsScreen;
