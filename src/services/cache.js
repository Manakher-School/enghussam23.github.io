import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEYS = {
  HOMEWORK: "cached_homework",
  MATERIALS: "cached_materials",
  NEWS: "cached_news",
  QUIZZES: "cached_quizzes",
  LAST_SYNC: "last_sync_time",
};

export const initializeCache = async () => {
  try {
    const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    console.log("Cache initialized. Last sync:", lastSync || "Never");
  } catch (error) {
    console.error("Error initializing cache:", error);
  }
};

export const cacheData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (error) {
    console.error("Error caching data:", error);
  }
};

export const getCachedData = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error getting cached data:", error);
    return null;
  }
};

export const cacheHomework = async (homework) => {
  await cacheData(CACHE_KEYS.HOMEWORK, homework);
};

export const getCachedHomework = async () => {
  return await getCachedData(CACHE_KEYS.HOMEWORK);
};

export const cacheMaterials = async (materials) => {
  await cacheData(CACHE_KEYS.MATERIALS, materials);
};

export const getCachedMaterials = async () => {
  return await getCachedData(CACHE_KEYS.MATERIALS);
};

export const cacheNews = async (news) => {
  await cacheData(CACHE_KEYS.NEWS, news);
};

export const getCachedNews = async () => {
  return await getCachedData(CACHE_KEYS.NEWS);
};

export const cacheQuizzes = async (quizzes) => {
  await cacheData(CACHE_KEYS.QUIZZES, quizzes);
};

export const getCachedQuizzes = async () => {
  return await getCachedData(CACHE_KEYS.QUIZZES);
};

export const clearCache = async () => {
  try {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.HOMEWORK,
      CACHE_KEYS.MATERIALS,
      CACHE_KEYS.NEWS,
      CACHE_KEYS.QUIZZES,
    ]);
    console.log("Cache cleared");
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

export const getLastSyncTime = async () => {
  try {
    const lastSync = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return lastSync ? new Date(lastSync) : null;
  } catch (error) {
    console.error("Error getting last sync time:", error);
    return null;
  }
};
