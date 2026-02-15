/**
 * PocketBase Data Service
 *
 * This service layer abstracts PocketBase API calls.
 *
 * IMPORTANT NOTES:
 * - Backend stores plain strings (NOT bilingual objects)
 * - Activities collection: type can be 'quiz' or 'exam' (no 'homework' type)
 * - Questions are in separate 'questions' collection
 * - Content filtering by class_id (not by grade string)
 * - Students must be enrolled to access class content
 */

import { pb } from "../lib/pocketbase";

/**
 * Helper: Build file URL for PocketBase attachments
 * @param {Object} record - PocketBase record
 * @param {string} filename - Filename from attachments array
 * @returns {string}
 */
export const getFileUrl = (record, filename) => {
  if (!record || !filename) return "";
  return pb.files.getUrl(record, filename);
};

/**
 * Helper: Format PocketBase timestamps to match frontend format
 * @param {string} pbDate - PocketBase date string
 * @returns {string} ISO 8601 string
 */
const formatDate = (pbDate) => {
  if (!pbDate) return new Date().toISOString();
  return new Date(pbDate).toISOString();
};

/**
 * FETCH ACTIVITIES (Quizzes/Exams)
 *
 * Backend only supports 'quiz' and 'exam' types
 * For homework-like activities, check if backend added that type
 */
export const fetchActivities = async (classIds = [], type = null) => {
  try {
    let filter = "";

    if (classIds.length > 0) {
      const classFilter = classIds.map((id) => `class_id='${id}'`).join(" || ");
      filter = `(${classFilter})`;
    }

    if (type) {
      filter += filter ? ` && type='${type}'` : `type='${type}'`;
    }

    const records = await pb.collection("activities").getFullList({
      filter: filter || undefined,
      sort: "-created",
      expand: "class_id",
    });

    return records.map((record) => ({
      id: record.id,
      title: record.title, // Plain string from backend
      class_id: record.class_id,
      type: record.type, // 'quiz' or 'exam'
      time_limit: record.time_limit,
      max_score: record.max_score,
      createdAt: formatDate(record.created),
      updatedAt: formatDate(record.updated),
      // Expanded data
      class: record.expand?.class_id,
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }
};

/**
 * FETCH QUESTIONS FOR ACTIVITY
 *
 * Students should NOT see correct_answer field
 * Use fields parameter to exclude sensitive data
 */
export const fetchQuestions = async (activityId, includeAnswers = false) => {
  try {
    const options = {
      filter: `activity_id='${activityId}'`,
      sort: "created",
    };

    // Students should NOT see correct answers
    if (!includeAnswers) {
      options.fields = "id,activity_id,type,question,options,created,updated";
    }

    const records = await pb.collection("questions").getFullList(options);

    return records.map((record) => ({
      id: record.id,
      activity_id: record.activity_id,
      type: record.type, // 'mcq', 'tf', 'short'
      question: record.question, // Plain string
      options: record.options, // Array for MCQ
      correct_answer: record.correct_answer, // Only if includeAnswers=true
      created: formatDate(record.created),
      updated: formatDate(record.updated),
    }));
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }
};

/**
 * FETCH LESSONS (Materials)
 *
 * Maps lessons to materials with attachment handling
 */
export const fetchLessons = async (classIds = []) => {
  try {
    let filter = "";

    if (classIds.length > 0) {
      const classFilter = classIds.map((id) => `class_id='${id}'`).join(" || ");
      filter = `(${classFilter})`;
    }

    const records = await pb.collection("lessons").getFullList({
      filter: filter || undefined,
      sort: "-created",
      expand: "class_id",
    });

    return records.map((record) => ({
      id: record.id,
      class_id: record.class_id,
      title: record.title, // Plain string
      content: record.content, // Plain string (HTML)
      attachments: record.attachments || [], // Array of filenames
      createdAt: formatDate(record.created),
      updatedAt: formatDate(record.updated),
      // Expanded data
      class: record.expand?.class_id,
      // File URLs
      files: (record.attachments || []).map((filename) => ({
        name: filename,
        url: getFileUrl(record, filename),
        type: getFileType(filename),
      })),
    }));
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw new Error(`Failed to fetch lessons: ${error.message}`);
  }
};

/**
 * FETCH NEWS
 *
 * Queries: news collection
 */
export const fetchNews = async (limit = null) => {
  try {
    const options = {
      filter: "is_published=true",
      sort: "-created",
    };

    if (limit) {
      options.perPage = limit;
    }

    const records = limit
      ? await pb.collection("news").getList(1, limit, options)
      : await pb.collection("news").getFullList(options);

    const newsItems = (records.items || records).map((record) => ({
      id: record.id,
      title: record.title, // Plain string
      content: record.content, // Plain string (HTML)
      excerpt: record.excerpt || record.content?.substring(0, 200) || "",
      category: record.category || "General",
      publishedAt: formatDate(record.created),
      type: "news",
      important: record.important || false,
      // Image handling
      imageUrl: record.image ? pb.files.getUrl(record, record.image) : null,
      imageThumbnail: record.image
        ? pb.files.getUrl(record, record.image, { thumb: "300x300" })
        : null,
      isPublished: record.is_published,
      created: formatDate(record.created),
      updated: formatDate(record.updated),
    }));

    return newsItems;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
};

/**
 * Helper: Get file type from filename extension
 */
const getFileType = (filename) => {
  if (!filename) return "unknown";
  const ext = filename.split(".").pop().toLowerCase();
  const typeMap = {
    pdf: "pdf",
    doc: "doc",
    docx: "doc",
    ppt: "ppt",
    pptx: "ppt",
    xls: "xls",
    xlsx: "xls",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    mp4: "video",
    mp3: "audio",
  };
  return typeMap[ext] || ext;
};

/**
 * SUBMIT ANSWERS (Quiz/Activity)
 *
 * Backend schema:
 * - activity_id: string (relation)
 * - student_id: string (relation)
 * - answers: JSON object { questionId: answer }
 * - score: number (auto-calculated by backend hook)
 *
 * NOTE: Do NOT send submitted_at, it's auto-generated
 */
export const submitAnswers = async (activityId, studentId, answers) => {
  try {
    const data = {
      activity_id: activityId,
      student_id: studentId,
      answers: answers, // JSON object: { question_id: answer }
    };

    const record = await pb.collection("submissions").create(data);

    return {
      success: true,
      submission: record,
      score: record.score, // Auto-calculated by backend
      message: "Submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw new Error(`Failed to submit: ${error.message}`);
  }
};

// Alias for backward compatibility
export const submitQuiz = submitAnswers;
export const submitHomework = (activityId, studentId, submission) => {
  // Convert old format to new
  const answers = submission.answers || { text: submission.text };
  return submitAnswers(activityId, studentId, answers);
};

/**
 * GET STUDENT SUBMISSIONS
 *
 * Fetch all submissions for a specific student
 */
export const getStudentSubmissions = async (studentId, activityType = null) => {
  try {
    let filter = `student_id='${studentId}'`;

    if (activityType) {
      filter += ` && activity_id.type='${activityType}'`;
    }

    const records = await pb.collection("submissions").getFullList({
      filter: filter,
      sort: "-created",
      expand: "activity_id", // Expand to get activity details
    });

    return records;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

/**
 * GET ENROLLMENTS
 *
 * Fetch student's enrollments with expanded class and course data
 */
export const getEnrollments = async (studentId) => {
  try {
    const records = await pb.collection("enrollments").getFullList({
      filter: `student_id='${studentId}' && status='active'`,
      expand: "class_id,class_id.course_id,class_id.teacher_id",
      sort: "-created",
    });

    return records;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    throw new Error(`Failed to fetch enrollments: ${error.message}`);
  }
};

/**
 * Authentication Helper: Check if user is logged in
 */
export const isAuthenticated = () => {
  return pb.authStore.isValid;
};

/**
 * Authentication Helper: Get current user
 */
export const getCurrentUser = () => {
  return pb.authStore.model;
};

/**
 * Authentication Helper: Login
 */
export const login = async (email, password) => {
  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    return {
      success: true,
      user: authData.record,
      token: authData.token,
    };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(`Login failed: ${error.message}`);
  }
};

/**
 * Authentication Helper: Logout
 */
export const logout = () => {
  pb.authStore.clear();
};

/**
 * ========================================
 * TEACHER DASHBOARD API FUNCTIONS
 * ========================================
 */

/**
 * FETCH TEACHER'S CLASSES
 *
 * Get all classes taught by the teacher
 */
export const fetchTeacherClasses = async (teacherId) => {
  try {
    const records = await pb.collection("classes").getFullList({
      filter: `teacher_id='${teacherId}'`,
      expand: "course_id,teacher_id",
      sort: "-created",
    });

    return records.map((record) => ({
      id: record.id,
      course_id: record.course_id,
      teacher_id: record.teacher_id,
      created: formatDate(record.created),
      updated: formatDate(record.updated),
      // Expanded data
      course: record.expand?.course_id,
      teacher: record.expand?.teacher_id,
    }));
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    throw new Error(`Failed to fetch classes: ${error.message}`);
  }
};

/**
 * FETCH CLASS ENROLLMENTS
 *
 * Get all students enrolled in a specific class
 */
export const fetchClassEnrollments = async (classId) => {
  try {
    const records = await pb.collection("enrollments").getFullList({
      filter: `class_id='${classId}' && status='active'`,
      expand: "student_id",
      sort: "-created",
    });

    return records.map((record) => ({
      id: record.id,
      student_id: record.student_id,
      class_id: record.class_id,
      status: record.status,
      enrolled_at: formatDate(record.created),
      // Expanded data
      student: record.expand?.student_id,
    }));
  } catch (error) {
    console.error("Error fetching class enrollments:", error);
    throw new Error(`Failed to fetch enrollments: ${error.message}`);
  }
};

/**
 * CREATE ACTIVITY (Teacher)
 *
 * Create a new quiz or exam
 */
export const createActivity = async (classId, activityData) => {
  try {
    const data = {
      class_id: classId,
      title: activityData.title,
      type: activityData.type, // 'quiz' or 'exam'
      time_limit: activityData.time_limit || null,
      max_score: activityData.max_score || 100,
    };

    const record = await pb.collection("activities").create(data);

    return {
      success: true,
      activity: record,
    };
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error(`Failed to create activity: ${error.message}`);
  }
};

/**
 * CREATE QUESTION (Teacher)
 *
 * Add a question to an activity
 */
export const createQuestion = async (activityId, questionData) => {
  try {
    const data = {
      activity_id: activityId,
      type: questionData.type, // 'mcq', 'tf', 'short'
      question: questionData.question,
      options: questionData.options || null,
      correct_answer: questionData.correct_answer,
    };

    const record = await pb.collection("questions").create(data);

    return {
      success: true,
      question: record,
    };
  } catch (error) {
    console.error("Error creating question:", error);
    throw new Error(`Failed to create question: ${error.message}`);
  }
};

/**
 * CREATE LESSON (Teacher)
 *
 * Create a new lesson/material
 */
export const createLesson = async (classId, lessonData, files = []) => {
  try {
    const formData = new FormData();
    formData.append("class_id", classId);
    formData.append("title", lessonData.title);
    formData.append("content", lessonData.content || "");

    // Add file attachments (up to 5 files)
    files.forEach((file) => {
      formData.append("attachments", file);
    });

    const record = await pb.collection("lessons").create(formData);

    return {
      success: true,
      lesson: record,
    };
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw new Error(`Failed to create lesson: ${error.message}`);
  }
};

/**
 * UPDATE ACTIVITY (Teacher)
 */
export const updateActivity = async (activityId, updates) => {
  try {
    const record = await pb
      .collection("activities")
      .update(activityId, updates);
    return {
      success: true,
      activity: record,
    };
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error(`Failed to update activity: ${error.message}`);
  }
};

/**
 * UPDATE LESSON (Teacher)
 */
export const updateLesson = async (lessonId, updates) => {
  try {
    const record = await pb.collection("lessons").update(lessonId, updates);
    return {
      success: true,
      lesson: record,
    };
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw new Error(`Failed to update lesson: ${error.message}`);
  }
};

/**
 * DELETE ACTIVITY (Teacher/Admin)
 */
export const deleteActivity = async (activityId) => {
  try {
    await pb.collection("activities").delete(activityId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error(`Failed to delete activity: ${error.message}`);
  }
};

/**
 * DELETE LESSON (Teacher/Admin)
 */
export const deleteLesson = async (lessonId) => {
  try {
    await pb.collection("lessons").delete(lessonId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw new Error(`Failed to delete lesson: ${error.message}`);
  }
};

/**
 * FETCH CLASS SUBMISSIONS (Teacher)
 *
 * Get all submissions for activities in a class
 */
export const fetchClassSubmissions = async (classId) => {
  try {
    const records = await pb.collection("submissions").getFullList({
      filter: `activity_id.class_id='${classId}'`,
      expand: "activity_id,student_id",
      sort: "-created",
    });

    return records.map((record) => ({
      id: record.id,
      activity_id: record.activity_id,
      student_id: record.student_id,
      answers: record.answers,
      score: record.score,
      submitted_at: formatDate(record.created),
      // Expanded data
      activity: record.expand?.activity_id,
      student: record.expand?.student_id,
    }));
  } catch (error) {
    console.error("Error fetching class submissions:", error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

/**
 * ========================================
 * ADMIN DASHBOARD API FUNCTIONS
 * ========================================
 */

/**
 * FETCH ALL USERS (Admin)
 */
export const fetchAllUsers = async (role = null) => {
  try {
    let filter = "";
    if (role) {
      filter = `role='${role}'`;
    }

    const records = await pb.collection("users").getFullList({
      filter: filter || undefined,
      sort: "-created",
    });

    return records;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

/**
 * FETCH STUDENTS FOR LOGIN (Public access)
 * Returns list of students for one-click login
 */
export const fetchStudentsForLogin = async () => {
  try {
    // Fetch active students only
    const records = await pb.collection("users").getFullList({
      filter: "role='student' && active=true",
      sort: "name",
      fields: "id,email,name,avatar", // Only public fields
    });

    return records;
  } catch (error) {
    console.error("Error fetching students for login:", error);
    throw new Error(`Failed to fetch students: ${error.message}`);
  }
};

/**
 * FETCH STUDENT BY NAME (Public access)
 * Finds a student by their full name for quick login
 */
export const fetchStudentByName = async (studentName) => {
  try {
    // Use filter with case-insensitive search (~)
    const records = await pb.collection("users").getFullList({
      filter: `role='student' && active=true && name~'${studentName}'`,
      fields: "id,email,name,avatar",
    });

    // Return exact match if found, otherwise return first partial match
    if (records.length === 0) {
      return null;
    }

    // Try to find exact match (case-insensitive)
    const exactMatch = records.find(
      (r) => r.name.toLowerCase() === studentName.toLowerCase(),
    );

    return exactMatch || records[0];
  } catch (error) {
    console.error("Error fetching student by name:", error);
    throw new Error(`Failed to find student: ${error.message}`);
  }
};

/**
 * CREATE USER (Admin)
 */
export const createUser = async (userData) => {
  try {
    const data = {
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.password,
      name: userData.name,
      role: userData.role || "student",
      active: userData.active !== undefined ? userData.active : true,
    };

    const record = await pb.collection("users").create(data);

    return {
      success: true,
      user: record,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

/**
 * UPDATE USER (Admin)
 */
export const updateUser = async (userId, updates) => {
  try {
    const record = await pb.collection("users").update(userId, updates);
    return {
      success: true,
      user: record,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * DELETE USER (Admin)
 */
export const deleteUser = async (userId) => {
  try {
    await pb.collection("users").delete(userId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

/**
 * FETCH ALL COURSES (Admin)
 */
export const fetchAllCourses = async () => {
  try {
    const records = await pb.collection("courses").getFullList({
      sort: "-created",
    });

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description || "",
      created: formatDate(record.created),
      updated: formatDate(record.updated),
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

/**
 * FETCH ALL CLASSES (Admin)
 */
export const fetchAllClasses = async () => {
  try {
    const records = await pb.collection("classes").getFullList({
      expand: "course_id,teacher_id",
      sort: "-created",
    });

    return records.map((record) => ({
      id: record.id,
      course_id: record.course_id,
      teacher_id: record.teacher_id,
      created: formatDate(record.created),
      updated: formatDate(record.updated),
      // Expanded data
      course: record.expand?.course_id,
      teacher: record.expand?.teacher_id,
    }));
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw new Error(`Failed to fetch classes: ${error.message}`);
  }
};

/**
 * CREATE COURSE (Admin)
 */
export const createCourse = async (courseData) => {
  try {
    const data = {
      title: courseData.title,
      description: courseData.description || "",
    };

    const record = await pb.collection("courses").create(data);

    return {
      success: true,
      course: record,
    };
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error(`Failed to create course: ${error.message}`);
  }
};

/**
 * CREATE CLASS (Admin)
 */
export const createClass = async (courseId, teacherId) => {
  try {
    const data = {
      course_id: courseId,
      teacher_id: teacherId,
    };

    const record = await pb.collection("classes").create(data);

    return {
      success: true,
      class: record,
    };
  } catch (error) {
    console.error("Error creating class:", error);
    throw new Error(`Failed to create class: ${error.message}`);
  }
};

/**
 * CREATE ENROLLMENT (Admin)
 */
export const createEnrollment = async (studentId, classId) => {
  try {
    const data = {
      student_id: studentId,
      class_id: classId,
      status: "active",
    };

    const record = await pb.collection("enrollments").create(data);

    return {
      success: true,
      enrollment: record,
    };
  } catch (error) {
    console.error("Error creating enrollment:", error);
    throw new Error(`Failed to create enrollment: ${error.message}`);
  }
};

// Export pb instance for direct access if needed
export { pb };
