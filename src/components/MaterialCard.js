import React from "react";
import { View, StyleSheet, Linking, Platform } from "react-native";
import { Card, Title, Paragraph, Chip, Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

const MaterialCard = ({ material }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleView = () => {
    // For web, open in new tab. For native, use WebView or in-app browser
    if (Platform.OS === "web") {
      window.open(material.fileUrl, "_blank");
    } else {
      Linking.openURL(material.fileUrl);
    }
  };

  const handleDownload = () => {
    // For web, trigger download. For native, use FileSystem
    if (Platform.OS === "web") {
      const link = document.createElement("a");
      link.href = material.fileUrl;
      link.download = `${material.title.en}.${material.fileType.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Linking.openURL(material.fileUrl);
    }
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
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{material.title[language]}</Title>
          <Chip style={styles.fileTypeChip} textStyle={styles.fileTypeText}>
            {material.fileType}
          </Chip>
        </View>

        <Paragraph style={styles.content}>
          {material.content[language]}
        </Paragraph>

        <View style={styles.metadata}>
          <Chip icon="book" style={styles.chip}>
            {material.subject[language]}
          </Chip>
          <Chip icon="school" style={styles.chip}>
            {t("materials.grade")} {material.grade}
          </Chip>
          <Chip icon="file" style={styles.chip}>
            {material.fileSize}
          </Chip>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(material.createdAt)}</Text>
        </View>
      </Card.Content>

      <Card.Actions>
        <Button mode="outlined" onPress={handleView} icon="eye">
          {t("materials.view")}
        </Button>
        <Button mode="contained" onPress={handleDownload} icon="download">
          {t("materials.download")}
        </Button>
      </Card.Actions>
    </Card>
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
  fileTypeChip: {
    marginLeft: 10,
    backgroundColor: "#E3F2FD",
  },
  fileTypeText: {
    color: "#1976D2",
    fontSize: 11,
    fontWeight: "bold",
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
  date: {
    fontSize: 13,
    color: "#666",
  },
});

export default MaterialCard;
