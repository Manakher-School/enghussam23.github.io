import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import homeworkData from "../data/homework.json";
import materialsData from "../data/materials.json";
import newsData from "../data/news.json";
import quizzesData from "../data/quizzes.json";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [homework, setHomework] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [news, setNews] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [comments, setComments] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load data from JSON files
      setHomework(homeworkData);
      setMaterials(materialsData);
      setNews(newsData);
      setQuizzes(quizzesData);

      // Load user-specific data from AsyncStorage
      const savedSubmissions = await AsyncStorage.getItem("submissions");
      const savedComments = await AsyncStorage.getItem("comments");
      const savedQuizAttempts = await AsyncStorage.getItem("quizAttempts");

      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
      if (savedComments) setComments(JSON.parse(savedComments));
      if (savedQuizAttempts) setQuizAttempts(JSON.parse(savedQuizAttempts));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitHomework = async (homeworkId, submission) => {
    try {
      const newSubmissions = {
        ...submissions,
        [homeworkId]: {
          ...submission,
          submittedAt: new Date().toISOString(),
          status: "submitted",
        },
      };
      setSubmissions(newSubmissions);
      await AsyncStorage.setItem("submissions", JSON.stringify(newSubmissions));
    } catch (error) {
      console.error("Error submitting homework:", error);
    }
  };

  const addComment = async (newsId, comment) => {
    try {
      const newsComments = comments[newsId] || [];
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        author: "Student", // Mock user
        timestamp: new Date().toISOString(),
      };
      const newComments = {
        ...comments,
        [newsId]: [...newsComments, newComment],
      };
      setComments(newComments);
      await AsyncStorage.setItem("comments", JSON.stringify(newComments));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const submitQuiz = async (quizId, answers, score) => {
    try {
      const newAttempt = {
        answers,
        score,
        submittedAt: new Date().toISOString(),
        status: "pending", // Waiting for teacher review
      };
      const newQuizAttempts = {
        ...quizAttempts,
        [quizId]: newAttempt,
      };
      setQuizAttempts(newQuizAttempts);
      await AsyncStorage.setItem(
        "quizAttempts",
        JSON.stringify(newQuizAttempts)
      );
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const searchContent = (query) => {
    const lowerQuery = query.toLowerCase();

    const searchInObject = (obj) => {
      if (typeof obj === "string") {
        return obj.toLowerCase().includes(lowerQuery);
      }
      if (typeof obj === "object" && obj !== null) {
        return Object.values(obj).some((val) => searchInObject(val));
      }
      return false;
    };

    return {
      homework: homework.filter((item) => searchInObject(item)),
      materials: materials.filter((item) => searchInObject(item)),
      news: news.filter((item) => searchInObject(item)),
    };
  };

  return (
    <DataContext.Provider
      value={{
        homework,
        materials,
        news,
        quizzes,
        submissions,
        comments,
        quizAttempts,
        loading,
        submitHomework,
        addComment,
        submitQuiz,
        searchContent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
