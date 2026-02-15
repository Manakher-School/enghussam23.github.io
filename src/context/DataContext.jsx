import React, { createContext, useState, useContext, useEffect } from 'react';
import localforage from 'localforage';
import { useAuth } from './AuthContext';
import { pb } from '../lib/pocketbase';
import { 
  fetchNews, 
  fetchActivities, 
  fetchLessons,
  transformRecordToFrontend 
} from '../services/api';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Local data (offline support)
  const [comments, setComments] = useState({});
  const [localSubmissions, setLocalSubmissions] = useState({});
  const [pendingSync, setPendingSync] = useState([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      setIsOnline(true);
      // Sync pending submissions when back online
      syncPendingData();
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Real-time subscriptions for updates
  useEffect(() => {
    if (!isAuthenticated() || !user) return;

    // Subscribe to news updates (visible to all)
    pb.collection('news').subscribe('*', (e) => {
      console.log('News update:', e.action);
      
      const transformedRecord = transformRecordToFrontend(e.record, ['title', 'content']);
      
      if (e.action === 'create' && e.record.is_published) {
        setNews(prev => [transformedRecord, ...prev]);
      } else if (e.action === 'update') {
        setNews(prev => prev.map(item => 
          item.id === e.record.id ? transformedRecord : item
        ));
      } else if (e.action === 'delete') {
        setNews(prev => prev.filter(item => item.id !== e.record.id));
      }
    });

    // Subscribe to activities updates (students see new homework/quizzes)
    pb.collection('activities').subscribe('*', (e) => {
      console.log('Activity update:', e.action);
      
      const transformedRecord = transformRecordToFrontend(e.record, ['title', 'content', 'description', 'subject']);
      
      if (e.action === 'create') {
        setActivities(prev => [transformedRecord, ...prev]);
      } else if (e.action === 'update') {
        setActivities(prev => prev.map(item => 
          item.id === e.record.id ? transformedRecord : item
        ));
      } else if (e.action === 'delete') {
        setActivities(prev => prev.filter(item => item.id !== e.record.id));
      }
    });

    // Subscribe to lessons updates (new materials)
    pb.collection('lessons').subscribe('*', (e) => {
      console.log('Lesson update:', e.action);
      
      const transformedRecord = transformRecordToFrontend(e.record, ['title', 'content', 'subject']);
      
      if (e.action === 'create') {
        setLessons(prev => [transformedRecord, ...prev]);
      } else if (e.action === 'update') {
        setLessons(prev => prev.map(item => 
          item.id === e.record.id ? transformedRecord : item
        ));
      } else if (e.action === 'delete') {
        setLessons(prev => prev.filter(item => item.id !== e.record.id));
      }
    });

    // Subscribe to submissions updates (for teachers to see new submissions)
    if (user.role === 'teacher' || user.role === 'admin') {
      pb.collection('submissions').subscribe('*', (e) => {
        console.log('Submission update:', e.action);
        
        if (e.action === 'create') {
          setSubmissions(prev => [e.record, ...prev]);
        } else if (e.action === 'update') {
          setSubmissions(prev => prev.map(item => 
            item.id === e.record.id ? e.record : item
          ));
        } else if (e.action === 'delete') {
          setSubmissions(prev => prev.filter(item => item.id !== e.record.id));
        }
      });
    }

    // Cleanup subscriptions on unmount
    return () => {
      pb.collection('news').unsubscribe('*');
      pb.collection('activities').unsubscribe('*');
      pb.collection('lessons').unsubscribe('*');
      if (user.role === 'teacher' || user.role === 'admin') {
        pb.collection('submissions').unsubscribe('*');
      }
    };
  }, [user?.id, user?.role, isAuthenticated]);

  /**
   * Load all data from PocketBase based on user role and enrollments
   */
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if offline and load from cache
      if (!isOnline) {
        console.log('Offline mode: loading from cache');
        await loadFromCache();
        setError('You are offline. Showing cached data.');
        return;
      }

      if (user.role === 'student') {
        await loadStudentData();
      } else if (user.role === 'teacher') {
        await loadTeacherData();
      } else if (user.role === 'admin') {
        await loadAdminData();
      }

      // Cache data after successful load
      await saveToCache('enrollments', enrollments);
      await saveToCache('classes', classes);
      await saveToCache('lessons', lessons);
      await saveToCache('activities', activities);
      await saveToCache('news', news);
      await saveToCache('submissions', submissions);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      
      // Try to load from cache on error
      console.log('Fetch failed: attempting to load from cache');
      await loadFromCache();
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

    // 3. Get lessons for enrolled classes using API service
    const lessonRecords = await fetchLessons(classIds);
    setLessons(lessonRecords);

    // 4. Get activities for enrolled classes using API service
    const activityRecords = await fetchActivities(classIds);
    setActivities(activityRecords);

    // 5. Get student's submissions
    const submissionRecords = await pb.collection('submissions').getFullList({
      filter: `student_id='${user.id}'`,
      expand: 'activity_id',
      sort: '-created'
    });
    setSubmissions(submissionRecords);

    // 6. Get news using API service
    const newsRecords = await fetchNews(20);
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

    // Get lessons for teacher's classes using API service
    const lessonRecords = await fetchLessons(classIds);
    setLessons(lessonRecords);

    // Get activities for teacher's classes using API service
    const activityRecords = await fetchActivities(classIds);
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

    // Get news using API service
    const newsRecords = await fetchNews();
    setNews(newsRecords);
  };

  /**
   * Load data for admin role
   */
  const loadAdminData = async () => {
    // Admins get all data
    const [classRecords, lessonRecords, activityRecords, newsRecords, submissionRecords] = await Promise.all([
      pb.collection('classes').getFullList({ expand: 'course_id,teacher_id', sort: '-created' }),
      fetchLessons([]), // Fetch all lessons using API service
      fetchActivities([]), // Fetch all activities using API service
      fetchNews(), // Fetch all news using API service
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
      const savedPendingSync = await localforage.getItem('pendingSync');

      if (savedComments) setComments(savedComments);
      if (savedLocalSubmissions) setLocalSubmissions(savedLocalSubmissions);
      if (savedPendingSync) setPendingSync(savedPendingSync);
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  /**
   * Save data to cache
   */
  const saveToCache = async (key, data) => {
    try {
      await localforage.setItem(key, data);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  /**
   * Load from cache when offline
   */
  const loadFromCache = async () => {
    try {
      const cached = {
        enrollments: await localforage.getItem('enrollments'),
        classes: await localforage.getItem('classes'),
        lessons: await localforage.getItem('lessons'),
        activities: await localforage.getItem('activities'),
        news: await localforage.getItem('news'),
        submissions: await localforage.getItem('submissions'),
      };

      if (cached.enrollments) setEnrollments(cached.enrollments);
      if (cached.classes) setClasses(cached.classes);
      if (cached.lessons) setLessons(cached.lessons);
      if (cached.activities) setActivities(cached.activities);
      if (cached.news) setNews(cached.news);
      if (cached.submissions) setSubmissions(cached.submissions);

      return cached;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  };

  /**
   * Sync pending submissions when back online
   */
  const syncPendingData = async () => {
    if (!isOnline || pendingSync.length === 0) return;

    console.log('Syncing pending data...', pendingSync.length, 'items');
    const synced = [];
    const failed = [];

    for (const item of pendingSync) {
      try {
        if (item.type === 'submission') {
          await pb.collection('submissions').create(item.data);
          synced.push(item);
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
        failed.push(item);
      }
    }

    // Remove synced items from pending queue
    const remaining = failed;
    setPendingSync(remaining);
    await localforage.setItem('pendingSync', remaining);

    if (synced.length > 0) {
      console.log(`Successfully synced ${synced.length} items`);
      // Reload data to get fresh state
      await loadAllData();
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
    const data = {
      activity_id: activityId,
      student_id: user.id,
      answers: submissionData.answers || {},
      submission_text: submissionData.text || '',
    };

    try {
      // If offline, queue for later sync
      if (!isOnline) {
        console.log('Offline: queuing submission for sync');
        const pendingItem = {
          id: Date.now().toString(),
          type: 'submission',
          data,
          files: submissionData.files || [], // Store file references for offline sync
          timestamp: new Date().toISOString(),
        };
        
        const newPending = [...pendingSync, pendingItem];
        setPendingSync(newPending);
        await localforage.setItem('pendingSync', newPending);
        
        // Save locally
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
        
        return { 
          success: true, 
          offline: true,
          message: 'Submission saved. Will sync when online.'
        };
      }

      // If files are included, use FormData for upload
      if (submissionData.files && submissionData.files.length > 0) {
        const formData = new FormData();
        formData.append('activity_id', activityId);
        formData.append('student_id', user.id);
        formData.append('submission_text', submissionData.text || '');
        formData.append('answers', JSON.stringify(submissionData.answers || {}));
        
        // Append each file
        submissionData.files.forEach((file, index) => {
          formData.append('files', file);
        });
        
        const record = await pb.collection('submissions').create(formData);
        
        // Update local state
        setSubmissions(prev => [...prev, record]);
        
        return { success: true, submission: record };
      } else {
        // Text-only submission
        const record = await pb.collection('submissions').create(data);
        
        // Update local state
        setSubmissions(prev => [...prev, record]);
        
        return { success: true, submission: record };
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      
      // Save locally if online submit fails
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
    const data = {
      activity_id: activityId,
      student_id: user.id,
      answers: answers, // { questionId: answer }
    };

    try {
      // If offline, queue for later sync
      if (!isOnline) {
        console.log('Offline: queuing quiz submission for sync');
        const pendingItem = {
          id: Date.now().toString(),
          type: 'submission',
          data,
          timestamp: new Date().toISOString(),
        };
        
        const newPending = [...pendingSync, pendingItem];
        setPendingSync(newPending);
        await localforage.setItem('pendingSync', newPending);
        
        return { 
          success: true, 
          offline: true,
          message: 'Quiz saved. Will sync when online.'
        };
      }

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
        isOnline,
        pendingSync,
        
        // Methods
        submitHomework,
        submitQuiz,
        addComment,
        getSubmissionForActivity,
        refreshData,
        syncPendingData,
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
