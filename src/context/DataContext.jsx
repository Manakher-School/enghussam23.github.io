import React, { createContext, useState, useContext, useEffect } from 'react';
import localforage from 'localforage';
import { useGrade } from './GradeContext';
import homeworkData from '../data/homework.json';
import materialsData from '../data/materials.json';
import newsData from '../data/news.json';
import quizzesData from '../data/quizzes.json';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { gradeSelection } = useGrade();
  const [submissions, setSubmissions] = useState({});
  const [comments, setComments] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedSubmissions = await localforage.getItem('submissions');
      const savedComments = await localforage.getItem('comments');
      const savedQuizAttempts = await localforage.getItem('quizAttempts');

      if (savedSubmissions) setSubmissions(savedSubmissions);
      if (savedComments) setComments(savedComments);
      if (savedQuizAttempts) setQuizAttempts(savedQuizAttempts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter content based on grade selection
  const filterByGrade = (items) => {
    if (!gradeSelection) return items;
    return items.filter(item => item.grade === gradeSelection.grade);
  };

  const homework = filterByGrade(homeworkData);
  const materials = filterByGrade(materialsData);
  const news = filterByGrade(newsData);
  const quizzes = filterByGrade(quizzesData);

  const submitHomework = async (homeworkId, submission) => {
    const newSubmissions = {
      ...submissions,
      [homeworkId]: {
        ...submission,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      },
    };
    setSubmissions(newSubmissions);
    await localforage.setItem('submissions', newSubmissions);
  };

  const addComment = async (newsId, comment) => {
    const newsComments = comments[newsId] || [];
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      author: 'Student',
      timestamp: new Date().toISOString(),
    };
    const newComments = {
      ...comments,
      [newsId]: [...newsComments, newComment],
    };
    setComments(newComments);
    await localforage.setItem('comments', newComments);
  };

  const submitQuiz = async (quizId, answers, score) => {
    const newAttempt = {
      answers,
      score,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    const newQuizAttempts = {
      ...quizAttempts,
      [quizId]: newAttempt,
    };
    setQuizAttempts(newQuizAttempts);
    await localforage.setItem('quizAttempts', newQuizAttempts);
  };

  const searchContent = (query) => {
    const lowerQuery = query.toLowerCase();
    
    const searchInObject = (obj) => {
      if (typeof obj === 'string') {
        return obj.toLowerCase().includes(lowerQuery);
      }
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).some(val => searchInObject(val));
      }
      return false;
    };

    return {
      homework: homework.filter(item => searchInObject(item)),
      materials: materials.filter(item => searchInObject(item)),
      news: news.filter(item => searchInObject(item)),
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
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
