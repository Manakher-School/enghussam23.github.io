import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initializeNotifications = async () => {
  try {
    if (Platform.OS === "web") {
      console.log("Notifications are limited on web platform");
      return;
    }

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return;
    }

    // Load notification preferences
    const preferences = await getNotificationPreferences();
    console.log("Notification preferences loaded:", preferences);
  } catch (error) {
    console.error("Error initializing notifications:", error);
  }
};

export const getNotificationPreferences = async () => {
  try {
    const prefs = await AsyncStorage.getItem("notificationPreferences");
    return prefs
      ? JSON.parse(prefs)
      : {
          homework: true,
          materials: true,
          news: true,
        };
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return { homework: true, materials: true, news: true };
  }
};

export const setNotificationPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(
      "notificationPreferences",
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error("Error setting notification preferences:", error);
  }
};

export const scheduleNotification = async (title, body, data = {}) => {
  try {
    if (Platform.OS === "web") {
      console.log("Notification would be sent:", { title, body });
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
};

export const sendNewHomeworkNotification = async (homework) => {
  const prefs = await getNotificationPreferences();
  if (!prefs.homework) return;

  await scheduleNotification(
    "New Homework",
    `${homework.title.en} - Due: ${new Date(homework.dueDate).toLocaleDateString()}`,
    { type: "homework", id: homework.id }
  );
};

export const sendNewMaterialNotification = async (material) => {
  const prefs = await getNotificationPreferences();
  if (!prefs.materials) return;

  await scheduleNotification("New Material Available", material.title.en, {
    type: "material",
    id: material.id,
  });
};

export const sendNewNewsNotification = async (news) => {
  const prefs = await getNotificationPreferences();
  if (!prefs.news) return;

  await scheduleNotification("New Announcement", news.title.en, {
    type: "news",
    id: news.id,
  });
};
