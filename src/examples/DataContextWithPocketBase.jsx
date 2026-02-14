/**
 * EXAMPLE: Updated DataContext with PocketBase Integration
 * 
 * This is a refactored version of DataContext.jsx that uses PocketBase
 * instead of local JSON files.
 * 
 * Migration Steps:
 * 1. Replace JSON imports with API function calls
 * 2. Add async data fetching in useEffect
 * 3. Manage loading and error states
 * 4. Update submission functions to use PocketBase
 * 
 * Usage: Replace your existing DataContext.jsx with this implementation
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import localforage from 'localforage';
import { useGrade } from './GradeContext';

// Import PocketBase API functions
import {
  fetchHomework,
  fetchMaterials,
  fetchNews,
  fetchQuizzes,
  fetchExams,
  submitHomework as apiSubmitHomework,
  submitQuiz as apiSubmitQuiz,
  getStudentSubmissions,
  getCurrentUser,
  isAuthenticated
} from '../services/api';

const DataContext = createContext();

export default function DataProvider({ children }) {
  const { gradeSelection } = useGrade();
  
  // Data states
  const [homework, setHomework] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [news, setNews] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [exams, setExams] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User data states (still using localforage for offline support)
  const [submissions, setSubmissions] = useState({});
  const [comments, setComments] = useState({});
  const [quizAttempts, setQuizAttempts] = useState({});

  // Load data when component mounts or grade changes
  useEffect(() => {
    loadAllData();
  }, [gradeSelection?.grade]);

  // Load user data from localforage (for offline support)
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Load all content from PocketBase
   */
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const grade = gradeSelection?.grade;
      
      // Fetch all data in parallel for better performance
      const [
        homeworkData,
        materialsData,
        newsData,
        quizzesData,
        examsData
      ] = await Promise.all([
        fetchHomework(grade),
        fetchMaterials(grade),
        fetchNews(grade),
        fetchQuizzes(grade),
        fetchExams(grade)
      ]);
      
      setHomework(homeworkData);
      setMaterials(materialsData);
      setNews(newsData);
      setQuizzes(quizzesData);
      setExams(examsData);
      
      // If user is authenticated, also load their submissions from PocketBase
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        const userSubmissions = await getStudentSubmissions(currentUser.id);
        
        // Convert to the format your UI expects
        const submissionsMap = {};
        userSubmissions.forEach(sub => {
          submissionsMap[sub.activity_id] = {
            text: sub.submission_text,
            files: sub.submission_files,
            submittedAt: sub.submitted_at,
            status: sub.status || 'submitted',
            score: sub.score,
            stars: sub.stars || 0
          };
        });
        
        setSubmissions(submissionsMap);
        
        // Also save to localforage for offline access
        await localforage.setItem('submissions', submissionsMap);
      }
      
    } catch (err) {
      console.error('Error loading data from PocketBase:', err);
      setError(err.message);
      
      // Fallback to offline data if available
      await loadOfflineData();
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fallback: Load cached data from localforage when offline
   */
  const loadOfflineData = async () => {
    try {
      const cachedHomework = await localforage.getItem('cached_homework');
      const cachedMaterials = await localforage.getItem('cached_materials');
      const cachedNews = await localforage.getItem('cached_news');
      const cachedQuizzes = await localforage.getItem('cached_quizzes');
      
      if (cachedHomework) setHomework(cachedHomework);
      if (cachedMaterials) setMaterials(cachedMaterials);
      if (cachedNews) setNews(cachedNews);
      if (cachedQuizzes) setQuizzes(cachedQuizzes);
    } catch (err) {
      console.error('Error loading offline data:', err);
    }
  };

  /**
   * Load user-specific data from localforage
   */
  const loadUserData = async () => {
    try {
      const savedSubmissions = await localforage.getItem('submissions');
      const savedComments = await localforage.getItem('comments');
      const savedQuizAttempts = await localforage.getItem('quizAttempts');

      if (savedSubmissions) setSubmissions(savedSubmissions);
      if (savedComments) setComments(savedComments);
      if (savedQuizAttempts) setQuizAttempts(savedQuizAttempts);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  /**
   * Submit homework to PocketBase
   */
  const submitHomework = async (homeworkId, submission) => {
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Submit to PocketBase
      const result = await apiSubmitHomework(
        homeworkId,
        currentUser.id,
        submission
      );
      
      // Update local state
      const newSubmissions = {
        ...submissions,
        [homeworkId]: {
          ...submission,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          stars: submission.stars || 0,
        },
      };
      
      setSubmissions(newSubmissions);
      
      // Save to localforage for offline access
      await localforage.setItem('submissions', newSubmissions);
      
      return result;
      
    } catch (error) {
      console.error('Error submitting homework:', error);
      
      // Fallback: Save locally if PocketBase fails
      const newSubmissions = {
        ...submissions,
        [homeworkId]: {
          ...submission,
          submittedAt: new Date().toISOString(),
          status: 'pending_upload', // Mark as pending
          stars: submission.stars || 0,
        },
      };
      
      setSubmissions(newSubmissions);
      await localforage.setItem('submissions', newSubmissions);
      
      throw error;
    }
  };

  /**
   * Submit quiz answers to PocketBase
   */
  const submitQuizAnswers = async (quizId, answers) => {
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Submit to PocketBase
      const result = await apiSubmitQuiz(
        quizId,
        currentUser.id,
        answers
      );
      
      // Update local state
      const newAttempts = {
        ...quizAttempts,
        [quizId]: {
          answers,
          score: result.score,
          totalPoints: result.totalPoints,
          submittedAt: new Date().toISOString(),
          status: 'graded'
        },
      };
      
      setQuizAttempts(newAttempts);
      
      // Save to localforage
      await localforage.setItem('quizAttempts', newAttempts);
      
      return result;
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  };

  /**
   * Add comment to news item
   */
  const addComment = async (newsId, comment) => {
    const newComments = {
      ...comments,
      [newsId]: [
        ...(comments[newsId] || []),
        {
          ...comment,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ],
    };
    
    setComments(newComments);
    await localforage.setItem('comments', newComments);
    
    // TODO: Send to PocketBase comments collection if you create one
  };

  /**
   * Get submission status for a homework item
   */
  const getSubmissionStatus = (homeworkId) => {
    return submissions[homeworkId] || null;
  };

  /**
   * Get quiz attempt for a quiz item
   */
  const getQuizAttempt = (quizId) => {
    return quizAttempts[quizId] || null;
  };

  /**
   * Get comments for a news item
   */
  const getComments = (newsId) => {
    return comments[newsId] || [];
  };

  /**
   * Refresh data manually
   */
  const refreshData = () => {
    loadAllData();
  };

  const value = {
    // Data
    homework,
    materials,
    news,
    quizzes,
    exams,
    
    // UI States
    loading,
    error,
    
    // User Data
    submissions,
    comments,
    quizAttempts,
    
    // Actions
    submitHomework,
    submitQuizAnswers,
    addComment,
    
    // Getters
    getSubmissionStatus,
    getQuizAttempt,
    getComments,
    
    // Utils
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Custom hook to use the DataContext
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
