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

export default function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  // Server data states
  const [courses, setCourses] = useState([]);
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
      setIsOnline(true);
      syncPendingData();
    };
    const handleOffline = () => {
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
      setCourses([]);
      setLessons([]);
      setActivities([]);
      setNews([]);
      setSubmissions([]);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated() || !user) return;

    pb.collection('news').subscribe('*', (e) => {
      const rec = transformRecordToFrontend(e.record, ['title', 'content']);
      if (e.action === 'create' && e.record.is_published) {
        setNews(prev => [rec, ...prev]);
      } else if (e.action === 'update') {
        setNews(prev => prev.map(item => item.id === e.record.id ? rec : item));
      } else if (e.action === 'delete') {
        setNews(prev => prev.filter(item => item.id !== e.record.id));
      }
    }).catch(err => console.warn('news subscription failed (collection may not exist yet):', err?.message || err));

    pb.collection('activities').subscribe('*', (e) => {
      const rec = transformRecordToFrontend(e.record, ['title', 'content', 'description', 'subject']);
      if (e.action === 'create') {
        setActivities(prev => [rec, ...prev]);
      } else if (e.action === 'update') {
        setActivities(prev => prev.map(item => item.id === e.record.id ? rec : item));
      } else if (e.action === 'delete') {
        setActivities(prev => prev.filter(item => item.id !== e.record.id));
      }
    });

    pb.collection('lessons').subscribe('*', (e) => {
      const rec = transformRecordToFrontend(e.record, ['title', 'content', 'subject']);
      if (e.action === 'create') {
        setLessons(prev => [rec, ...prev]);
      } else if (e.action === 'update') {
        setLessons(prev => prev.map(item => item.id === e.record.id ? rec : item));
      } else if (e.action === 'delete') {
        setLessons(prev => prev.filter(item => item.id !== e.record.id));
      }
    });

    if (user.role === 'teacher' || user.role === 'admin') {
      pb.collection('submissions').subscribe('*', (e) => {
        if (e.action === 'create') {
          setSubmissions(prev => [e.record, ...prev]);
        } else if (e.action === 'update') {
          setSubmissions(prev => prev.map(item => item.id === e.record.id ? e.record : item));
        } else if (e.action === 'delete') {
          setSubmissions(prev => prev.filter(item => item.id !== e.record.id));
        }
      });
    }

    return () => {
      pb.collection('news').unsubscribe('*');
      pb.collection('activities').unsubscribe('*');
      pb.collection('lessons').unsubscribe('*');
      if (user.role === 'teacher' || user.role === 'admin') {
        pb.collection('submissions').unsubscribe('*');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  /**
   * Safely fetch news — returns [] instead of throwing when the collection
   * doesn't exist yet (404 "The requested resource wasn't found").
   */
  const safelyFetchNews = async (limit) => {
    try {
      return await fetchNews(limit);
    } catch (err) {
      console.warn('fetchNews failed (collection may not exist yet):', err?.message || err);
      return [];
    }
  };

  /**
   * Load all data based on user role
   */
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isOnline) {
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
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      await loadFromCache();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load data for student role.
   * Finds the student's enrolled classes, then loads content for those classes.
   */
  const loadStudentData = async () => {
    // 1. Find all active enrollments for this student
    const enrollmentRecords = await pb.collection('enrollments').getFullList({
      filter: `student_id='${user.id}' && status='active'`,
      sort: '-created',
      requestKey: null,
    });

    const classIds = enrollmentRecords.map(e => e.class_id);

    if (classIds.length === 0) {
      // Not enrolled in any class — show empty state, not an error
      console.warn('Student has no active enrollments.');
      setCourses([]);
      setLessons([]);
      setActivities([]);
      setSubmissions([]);
      setNews(await safelyFetchNews(20));
      return;
    }

    // 2. Fetch lessons, activities, submissions, and news in parallel
    const [lessonRecords, activityRecords, submissionRecords, newsRecords] = await Promise.all([
      fetchLessons(classIds),
      fetchActivities(classIds),
      pb.collection('submissions').getFullList({
        filter: `student_id='${user.id}'`,
        expand: 'activity_id',
        sort: '-created',
        requestKey: null,
      }),
      safelyFetchNews(20),
    ]);

    setLessons(lessonRecords);
    setActivities(activityRecords);
    setSubmissions(submissionRecords);
    setNews(newsRecords);

    // Cache with fresh data
    await saveToCache('lessons', lessonRecords);
    await saveToCache('activities', activityRecords);
    await saveToCache('submissions', submissionRecords);
    await saveToCache('news', newsRecords);
  };

  /**
   * Load data for teacher role.
   * Fetches classes where teacher_id = user.id, then content for those classes.
   */
  const loadTeacherData = async () => {
    // 1. Fetch classes taught by this teacher
    const classRecords = await pb.collection('classes').getFullList({
      filter: `teacher_id='${user.id}'`,
      expand: 'course_id',
      sort: 'created',
      requestKey: null,
    });

    const mappedClasses = classRecords.map(r => ({
      id: r.id,
      course_id: r.course_id,
      teacher_id: r.teacher_id,
      course: r.expand?.course_id || null,
      createdAt: r.created,
      updatedAt: r.updated,
    }));
    setCourses(mappedClasses);

    const classIds = mappedClasses.map(c => c.id);

    if (classIds.length === 0) {
      setLessons([]);
      setActivities([]);
      setNews(await safelyFetchNews());
      return;
    }

    // 2. Fetch lessons, activities, and news in parallel
    const [lessonRecords, activityRecords, newsRecords] = await Promise.all([
      fetchLessons(classIds),
      fetchActivities(classIds),
      safelyFetchNews(),
    ]);

    setLessons(lessonRecords);
    setActivities(activityRecords);
    setNews(newsRecords);

    // 3. Fetch all submissions for teacher's activities
    const activityIds = activityRecords.map(a => a.id);
    if (activityIds.length > 0) {
      const activityFilter = activityIds.map(id => `activity_id='${id}'`).join(' || ');
      const submissionRecords = await pb.collection('submissions').getFullList({
        filter: activityFilter,
        expand: 'student_id,activity_id',
        sort: '-created',
      });
      setSubmissions(submissionRecords);
      await saveToCache('submissions', submissionRecords);
    }

    await saveToCache('courses', mappedClasses);
    await saveToCache('lessons', lessonRecords);
    await saveToCache('activities', activityRecords);
    await saveToCache('news', newsRecords);
  };

  /**
   * Load data for admin role.
   * Fetches everything with no filters.
   */
  const loadAdminData = async () => {
    const [classRecords, lessonRecords, activityRecords, newsRecords, submissionRecords] =
      await Promise.all([
        pb.collection('classes').getFullList({ expand: 'course_id,teacher_id', sort: 'created', requestKey: null }),
        fetchLessons([]),        // all lessons
        fetchActivities([]),     // all activities
        safelyFetchNews(),
        pb.collection('submissions').getFullList({
          expand: 'student_id,activity_id',
          sort: '-created',
        }),
      ]);

    const mappedClasses = classRecords.map(r => ({
      id: r.id,
      course_id: r.course_id,
      teacher_id: r.teacher_id,
      course: r.expand?.course_id || null,
      teacher: r.expand?.teacher_id || null,
      createdAt: r.created,
      updatedAt: r.updated,
    }));

    setCourses(mappedClasses);
    setLessons(lessonRecords);
    setActivities(activityRecords);
    setNews(newsRecords);
    setSubmissions(submissionRecords);

    // Cache with fresh data
    await saveToCache('courses', mappedClasses);
    await saveToCache('lessons', lessonRecords);
    await saveToCache('activities', activityRecords);
    await saveToCache('news', newsRecords);
    await saveToCache('submissions', submissionRecords);
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

  const saveToCache = async (key, data) => {
    try {
      await localforage.setItem(key, data);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const loadFromCache = async () => {
    try {
      const cached = {
        courses: await localforage.getItem('courses'),
        lessons: await localforage.getItem('lessons'),
        activities: await localforage.getItem('activities'),
        news: await localforage.getItem('news'),
        submissions: await localforage.getItem('submissions'),
      };
      if (cached.courses) setCourses(cached.courses);
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

    const remaining = failed;
    setPendingSync(remaining);
    await localforage.setItem('pendingSync', remaining);

    if (synced.length > 0) {
      await loadAllData();
    }
  };

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
      if (!isOnline) {
        const pendingItem = {
          id: Date.now().toString(),
          type: 'submission',
          data,
          files: submissionData.files || [],
          timestamp: new Date().toISOString(),
        };
        const newPending = [...pendingSync, pendingItem];
        setPendingSync(newPending);
        await localforage.setItem('pendingSync', newPending);

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

        return { success: true, offline: true, message: 'Submission saved. Will sync when online.' };
      }

      if (submissionData.files && submissionData.files.length > 0) {
        const formData = new FormData();
        formData.append('activity_id', activityId);
        formData.append('student_id', user.id);
        formData.append('submission_text', submissionData.text || '');
        formData.append('answers', JSON.stringify(submissionData.answers || {}));
        submissionData.files.forEach((file) => formData.append('files', file));
        const record = await pb.collection('submissions').create(formData);
        setSubmissions(prev => [...prev, record]);
        return { success: true, submission: record };
      } else {
        const record = await pb.collection('submissions').create(data);
        setSubmissions(prev => [...prev, record]);
        return { success: true, submission: record };
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
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
      answers,
    };

    try {
      if (!isOnline) {
        const pendingItem = {
          id: Date.now().toString(),
          type: 'submission',
          data,
          timestamp: new Date().toISOString(),
        };
        const newPending = [...pendingSync, pendingItem];
        setPendingSync(newPending);
        await localforage.setItem('pendingSync', newPending);
        return { success: true, offline: true, message: 'Quiz saved. Will sync when online.' };
      }

      const record = await pb.collection('submissions').create(data);
      setSubmissions(prev => [...prev, record]);
      return { success: true, submission: record, score: record.score };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  };

  const getSubmissionForActivity = (activityId) => {
    return submissions.find(s => s.activity_id === activityId && s.student_id === user?.id);
  };

  const addComment = async (newsId, comment) => {
    const newsComments = comments[newsId] || [];
    const newComment = {
      id: Date.now().toString(),
      text: comment,
      author: user?.name || 'Student',
      timestamp: new Date().toISOString(),
    };
    const newComments = { ...comments, [newsId]: [...newsComments, newComment] };
    setComments(newComments);
    await localforage.setItem('comments', newComments);
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Computed splits of activities
  const homework = activities.filter(a => a.type === 'homework' || a.type === 'assignment');
  const quizzes = activities.filter(a => a.type === 'quiz');
  const exams = activities.filter(a => a.type === 'exam');
  const materials = lessons;

  return (
    <DataContext.Provider
      value={{
        // Data
        courses,
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
