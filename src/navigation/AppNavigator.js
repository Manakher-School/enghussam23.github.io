import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

import HomeworkScreen from "../screens/HomeworkScreen";
import MaterialsScreen from "../screens/MaterialsScreen";
import NewsScreen from "../screens/NewsScreen";

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Homework") {
              iconName = focused
                ? "book-open-page-variant"
                : "book-open-page-variant-outline";
            } else if (route.name === "Materials") {
              iconName = focused ? "folder" : "folder-outline";
            } else if (route.name === "News") {
              iconName = focused ? "newspaper" : "newspaper-variant-outline";
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: "#2196F3",
          tabBarInactiveTintColor: "gray",
          headerShown: true,
          tabBarStyle: {
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        })}
      >
        <Tab.Screen
          name="Homework"
          component={HomeworkScreen}
          options={{ title: t("tabs.homework") }}
        />
        <Tab.Screen
          name="Materials"
          component={MaterialsScreen}
          options={{ title: t("tabs.materials") }}
        />
        <Tab.Screen
          name="News"
          component={NewsScreen}
          options={{ title: t("tabs.news") }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
