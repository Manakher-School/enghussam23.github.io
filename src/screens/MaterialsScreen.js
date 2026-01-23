import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Linking,
} from "react-native";
import {
  Searchbar,
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Menu,
  Divider,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useData } from "../context/DataContext";
import { useLanguage } from "../context/LanguageContext";
import MaterialCard from "../components/MaterialCard";

const MaterialsScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { materials, loading } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectMenuVisible, setSubjectMenuVisible] = useState(false);
  const [gradeMenuVisible, setGradeMenuVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Get unique subjects and grades
  const subjects = [
    "all",
    ...new Set(materials.map((m) => m.subject[language])),
  ];
  const grades = ["all", ...new Set(materials.map((m) => m.grade))];

  const filteredMaterials = materials.filter((item) => {
    const titleMatch =
      item.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch =
      item.content.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.en.toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = titleMatch || contentMatch;

    const subjectMatch =
      subjectFilter === "all" || item.subject[language] === subjectFilter;
    const gradeMatch = gradeFilter === "all" || item.grade === gradeFilter;

    return searchMatch && subjectMatch && gradeMatch;
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

      <View style={styles.filterContainer}>
        <Menu
          visible={subjectMenuVisible}
          onDismiss={() => setSubjectMenuVisible(false)}
          anchor={
            <Chip
              icon="filter"
              onPress={() => setSubjectMenuVisible(true)}
              style={styles.filterChip}
            >
              {subjectFilter === "all"
                ? t("materials.filterBySubject")
                : subjectFilter}
            </Chip>
          }
        >
          {subjects.map((subject) => (
            <Menu.Item
              key={subject}
              onPress={() => {
                setSubjectFilter(subject);
                setSubjectMenuVisible(false);
              }}
              title={subject === "all" ? t("materials.all") : subject}
            />
          ))}
        </Menu>

        <Menu
          visible={gradeMenuVisible}
          onDismiss={() => setGradeMenuVisible(false)}
          anchor={
            <Chip
              icon="filter"
              onPress={() => setGradeMenuVisible(true)}
              style={styles.filterChip}
            >
              {gradeFilter === "all"
                ? t("materials.filterByGrade")
                : gradeFilter}
            </Chip>
          }
        >
          {grades.map((grade) => (
            <Menu.Item
              key={grade}
              onPress={() => {
                setGradeFilter(grade);
                setGradeMenuVisible(false);
              }}
              title={
                grade === "all"
                  ? t("materials.all")
                  : `${t("materials.grade")} ${grade}`
              }
            />
          ))}
        </Menu>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((item) => (
            <MaterialCard key={item.id} material={item} />
          ))
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
  filterContainer: {
    flexDirection: "row",
    padding: 10,
    gap: 10,
  },
  filterChip: {
    marginRight: 5,
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 10,
  },
});

export default MaterialsScreen;
