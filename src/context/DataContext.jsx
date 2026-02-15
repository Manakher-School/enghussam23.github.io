import React, { createContext, useState, useContext, useEffect } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';
import { pb } from '../lib/pocketbase';

const DataContext = createContext();

// Export the provider as default
export default function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  // Server data states
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activities, setActivities] = useState([]);
  const [news, setNews] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local data (offline support)
  const [comments, setComments] = useState({});
  const [localSubmissions, setLocalSubmissions] = useState({});

  // Load data when user authenticates
  useEffect(() => {
    if (isAuthenticated() && user) {
      loadAllData();
      loadLocalData();
    } else {
      // Clear data when logged out
      setEnrollments([]);
      setClasses([]);
      setLessons([]);
      setActivities([]);
      setNews([]);
      setSubmissions([]);
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  /**
   * Load all data from PocketBase based on user role and enrollments
   */
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user.role === 'student') {
        await loadStudentData();
      } else if (user.role === 'teacher') {
        await loadTeacherData();
      } else if (user.role === 'admin') {
        await loadAdminData();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load data for student role
   */
  const loadStudentData = async () => {
    // 1. Get student's enrollments
    const enrollmentRecords = await pb.collection('enrollments').getFullList({
      filter: `student_id='${user.id}' && status='active'`,
      expand: 'class_id,class_id.course_id,class_id.teacher_id',
      sort: '-created'
    });
    setEnrollments(enrollmentRecords);

    // Extract class IDs
    const classIds = enrollmentRecords.map(e => e.class_id);
    
    if (classIds.length === 0) {
      setClasses([]);
      setLessons([]);
      setActivities([]);
      setNews([]);
      return;
    }

    // 2. Get classes (already expanded in enrollments)
    const classRecords = enrollmentRecords.map(e => e.expand?.class_id).filter(Boolean);
    setClasses(classRecords);

    // 3. Get lessons for enrolled classes
    const classFilter = classIds.map(id => `class_id='${id}'`).join(' || ');
    const lessonRecords = await pb.collection('lessons').getFullList({
      filter: classFilter,
      sort: '-created'
    });
    setLessons(lessonRecords);

    // 4. Get activities for enrolled classes
    const activityRecords = await pb.collection('activities').getFullList({
      filter: classFilter,
      sort: '-created'
    });
    setActivities(activityRecords);

    // 5. Get student's submissions
    const submissionRecords = await pb.collection('submissions').getFullList({
      filter: `student_id='${user.id}'`,
      expand: 'activity_id',
      sort: '-created'
    });
    setSubmissions(submissionRecords);

    // 6. Get news (available to all)
    const newsRecords = await pb.collection('news').getFullList({
      filter: 'is_published=true',
      sort: '-created',
      limit: 20
    });
    setNews(newsRecords);
  };

  /**
   * Load data for teacher role
   */
  const loadTeacherData = async () => {
    // Get classes taught by this teacher
    const classRecords = await pb.collection('classes').getFullList({
      filter: `teacher_id='${user.id}'`,
      expand: 'course_id',
      sort: '-created'
    });
    setClasses(classRecords);

    const classIds = classRecords.map(c => c.id);
    
    if (classIds.length === 0) {
      setLessons([]);
      setActivities([]);
      return;
    }

    // Get lessons for teacher's classes
    const classFilter = classIds.map(id => `class_id='${id}'`).join(' || ');
    const lessonRecords = await pb.collection('lessons').getFullList({
      filter: classFilter,
      sort: '-created'
    });
    setLessons(lessonRecords);

    // Get activities for teacher's classes
    const activityRecords = await pb.collection('activities').getFullList({
      filter: classFilter,
      sort: '-created'
    });
    setActivities(activityRecords);

    // Get all submissions for teacher's activities
    const activityIds = activityRecords.map(a => a.id);
    if (activityIds.length > 0) {
      const activityFilter = activityIds.map(id => `activity_id='${id}'`).join(' || ');
      const submissionRecords = await pb.collection('submissions').getFullList({
        filter: activityFilter,
        expand: 'student_id,activity_id',
        sort: '-created'
      });
      setSubmissions(submissionRecords);
    }

    // Get news
    const newsRecords = await pb.collection('news').getFullList({
      filter: 'is_published=true',
      sort: '-created'
    });
    setNews(newsRecords);
  };

  /**
   * Load data for admin role
   */
  const loadAdminData = async () => {
    // Admins get all data
    const [classRecords, lessonRecords, activityRecords, newsRecords, submissionRecords] = await Promise.all([
      pb.collection('classes').getFullList({ expand: 'course_id,teacher_id', sort: '-created' }),
      pb.collection('lessons').getFullList({ sort: '-created' }),
      pb.collection('activities').getFullList({ sort: '-created' }),
      pb.collection('news').getFullList({ sort: '-created' }),
      pb.collection('submissions').getFullList({ expand: 'student_id,activity_id', sort: '-created' })
    ]);

    setClasses(classRecords);
    setLessons(lessonRecords);
    setActivities(activityRecords);
    setNews(newsRecords);
    setSubmissions(submissionRecords);
  };

  /**
   * Load local data from localforage (offline support)
   */
  const loadLocalData = async () => {
    try {
      const savedComments = await localforage.getItem('comments');
      const savedLocalSubmissions = await localforage.getItem('localSubmissions');

      if (savedComments) setComments(savedComments);
      if (savedLocalSubmissions) setLocalSubmissions(savedLocalSubmissions);
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  // Computed data for backward compatibility
  const homework = activities.filter(a => a.type === 'homework' || a.type === 'assignment');
  const quizzes = activities.filter(a => a.type === 'quiz');
  const exams = activities.filter(a => a.type === 'exam');
  const materials = lessons; // Lessons are materials

  /**
   * Submit homework/activity to PocketBase
   */
  const submitHomework = async (activityId, submissionData) => {
    try {
      const data = {
        activity_id: activityId,
        student_id: user.id,
        answers: submissionData.answers || {},
        submission_text: submissionData.text || '',
      };

      const record = await pb.collection('submissions').create(data);
      
      // Update local state
      setSubmissions(prev => [...prev, record]);
      
      return { success: true, submission: record };
    } catch (error) {
      console.error('Error submitting homework:', error);
      
      // Save locally if offline
      const newLocalSubmissions = {
        ...localSubmissions,
        [activityId]: {
          ...submissionData,
          submittedAt: new Date().toISOString(),
          status: 'pending_sync',
        },
      };
      setLocalSubmissions(newLocalSubmissions);
      await localforage.setItem('localSubmissions', newLocalSubmissions);
      
      throw error;
    }
  };

  /**
   * Submit quiz answers to PocketBase
   */
  const submitQuiz = async (activityId, answers) => {
    try {
      const data = {
        activity_id: activityId,
        student_id: user.id,
        answers: answers, // { questionId: answer }
      };

      const record = await pb.collection('submissions').create(data);
      
      // Update local state
      setSubmissions(prev => [...prev, record]);
      
      return { 
        success: true, 
        submission: record,
        score: record.score // Auto-calculated by backend
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  };

  /**
   * Get submission for a specific activity
   */
  const getSubmissionForActivity = (activityId) => {
    return submissions.find(s => s.activity_id === activityId && s.student_id === user?.id);
  };

  /**
   * Add comment to news (local only for now)
   */
  const addComment = async (newsId, comment) => {
    const newsComments = comments[newsId] || [];
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      author: user?.name || 'Student',
      timestamp: new Date().toISOString(),
    };
    const newComments = {
      ...comments,
      [newsId]: [...newsComments, newComment],
    };
    setComments(newComments);
    await localforage.setItem('comments', newComments);
  };

  /**
   * Refresh data
   */
  const refreshData = async () => {
    await loadAllData();
  };

  return (
    <DataContext.Provider
      value={{
        // Data
        enrollments,
        classes,
        lessons,
        activities,
        homework,
        quizzes,
        exams,
        materials,
        news,
        submissions,
        
        // Computed/legacy
        userSubmissions: submissions.filter(s => s.student_id === user?.id),
        newsComments: Object.entries(comments).flatMap(([newsId, cmts]) => 
          (cmts || []).map(c => ({ ...c, newsId }))
        ),
        
        // States
        loading,
        error,
        
        // Methods
        submitHomework,
        submitQuiz,
        addComment,
        getSubmissionForActivity,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
