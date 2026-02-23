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
 * FETCH COURSES
 *
 * Fetches all published courses for a given grade.
 * Pass grade=null (or omit) to fetch all courses (admin use).
 * @param {string|null} grade - Grade ID e.g. "4", or null for all
 * @returns {Promise<Array>} Array of course records
 */
export const fetchCourses = async (grade = null) => {
  try {
    let filter = "is_published=true";
    if (grade) {
      filter += ` && grade='${grade}'`;
    }

    const records = await pb.collection("courses").getFullList({
      filter: filter || undefined,
      expand: "teacher_id",
      sort: "-created",
      requestKey: null,
    });

    return records.map((record) => ({
      id: record.id,
      title: formatBilingualField(record.title),
      grade: record.grade,
      teacher_id: record.teacher_id,
      teacher: record.expand?.teacher_id || null,
      isPublished: record.is_published,
      createdAt: formatDate(record.created),
      updatedAt: formatDate(record.updated),
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
};

/**
 * FETCH ACTIVITIES (Homework/Quizzes/Exams)
 *
 * Filters by course_id list. Pass empty array to fetch all (admin use).
 * @param {string[]} courseIds - Array of course IDs
 * @param {string|null} type - Optional type filter: 'homework', 'quiz', 'exam'
 */
/**
 * FETCH ACTIVITIES (Student/Teacher)
 *
 * Filters by grade_id and section_id for students, or by teacher's assigned sections
 * @param {Object} options - Filter options
 * @param {string} options.gradeId - Grade ID to filter by
 * @param {string} options.sectionId - Section ID to filter by (uses relation ~)
 * @param {string} options.type - Activity type ('quiz', 'exam', 'homework')
 * @param {string[]} options.classIds - Legacy class IDs (deprecated, for backward compatibility)
 */
export const fetchActivities = async (options = {}) => {
  try {
    let filter = "";

    // Support legacy classIds array parameter (backward compatibility)
    if (Array.isArray(options)) {
      const classIds = options;
      const type = arguments[1] || null;

      if (classIds.length > 0) {
        const classFilter = classIds
          .map((id) => `class_id='${id}'`)
          .join(" || ");
        filter = `(${classFilter})`;
      }

      if (type) {
        filter += filter ? ` && type='${type}'` : `type='${type}'`;
      }
    } else {
      // New grade/section-based filtering
      const { gradeId, sectionId, type, classIds } = options;

      if (gradeId) {
        filter = `grade_id='${gradeId}'`;
      }

      if (sectionId) {
        filter += filter
          ? ` && section_ids~'${sectionId}'`
          : `section_ids~'${sectionId}'`;
      }

      if (type) {
        filter += filter ? ` && type='${type}'` : `type='${type}'`;
      }

      // Legacy support
      if (classIds && classIds.length > 0) {
        const classFilter = classIds
          .map((id) => `class_id='${id}'`)
          .join(" || ");
        filter = filter
          ? `(${filter}) && (${classFilter})`
          : `(${classFilter})`;
      }
    }

    const records = await pb.collection("activities").getFullList({
      filter: filter || undefined,
      sort: "-created",
      expand: "class_id,grade_id,section_ids",
      requestKey: null,
    });

    return records.map((record) => ({
      id: record.id,
      title: formatBilingualField(record.title),
      content: formatBilingualField(record.content),
      description: formatBilingualField(record.description),
      subject: formatBilingualField(record.subject),
      class_id: record.class_id,
      grade_id: record.grade_id,
      section_ids: record.section_ids || [],
      grade: record.expand?.grade_id || record.expand?.class_id?.grade || null,
      sections: record.expand?.section_ids || [],
      type: record.type, // 'homework', 'quiz', or 'exam'
      time_limit: record.time_limit,
      max_score: record.max_score,
      dueDate: record.due_date ? formatDate(record.due_date) : null,
      date: record.due_date
        ? formatDate(record.due_date)
        : formatDate(record.created),
      createdAt: formatDate(record.created),
      updatedAt: formatDate(record.updated),
      class: record.expand?.class_id || null,
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
      requestKey: null,
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
      question: formatBilingualField(record.question), // Transform to bilingual object
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
 * Filters by grade_id and section_id for students
 * @param {Object} options - Filter options
 * @param {string} options.gradeId - Grade ID to filter by
 * @param {string} options.sectionId - Section ID to filter by (uses relation ~)
 * @param {string[]} options.classIds - Legacy class IDs (deprecated, for backward compatibility)
 */
export const fetchLessons = async (options = {}) => {
  try {
    let filter = "";

    // Support legacy classIds array parameter (backward compatibility)
    if (Array.isArray(options)) {
      const classIds = options;

      if (classIds.length > 0) {
        const classFilter = classIds
          .map((id) => `class_id='${id}'`)
          .join(" || ");
        filter = `(${classFilter})`;
      }
    } else {
      // New grade/section-based filtering
      const { gradeId, sectionId, classIds } = options;

      if (gradeId) {
        filter = `grade_id='${gradeId}'`;
      }

      if (sectionId) {
        filter += filter
          ? ` && section_ids~'${sectionId}'`
          : `section_ids~'${sectionId}'`;
      }

      // Legacy support
      if (classIds && classIds.length > 0) {
        const classFilter = classIds
          .map((id) => `class_id='${id}'`)
          .join(" || ");
        filter = filter
          ? `(${filter}) && (${classFilter})`
          : `(${classFilter})`;
      }
    }

    const records = await pb.collection("lessons").getFullList({
      filter: filter || undefined,
      sort: "-created",
      expand: "class_id,grade_id,section_ids",
      requestKey: null,
    });

    return records.map((record) => ({
      id: record.id,
      class_id: record.class_id,
      grade_id: record.grade_id,
      section_ids: record.section_ids || [],
      grade: record.expand?.grade_id || record.expand?.class_id?.grade || null,
      sections: record.expand?.section_ids || [],
      title: formatBilingualField(record.title),
      content: formatBilingualField(record.content),
      subject: formatBilingualField(record.subject),
      attachments: record.attachments || [],
      date: formatDate(record.created),
      createdAt: formatDate(record.created),
      updatedAt: formatDate(record.updated),
      class: record.expand?.class_id || null,
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
      requestKey: null,
    };

    if (limit) {
      options.perPage = limit;
    }

    const records = limit
      ? await pb.collection("news").getList(1, limit, options)
      : await pb.collection("news").getFullList(options);

    const newsItems = (records.items || records).map((record) => ({
      id: record.id,
      title: formatBilingualField(record.title), // Transform to bilingual object
      content: formatBilingualField(record.content), // Transform to bilingual object
      excerpt: record.excerpt || record.content?.substring(0, 200) || "",
      category: record.category || "General",
      publishedAt: formatDate(record.created),
      date: formatDate(record.created), // Add date field for compatibility
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
      expand: "activity_id",
      requestKey: null,
    });

    return records;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
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
      requestKey: null,
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
 * CREATE ACTIVITY (Teacher)
 *
 * Create a new quiz or exam
 */
/**
 * CREATE ACTIVITY (Teacher)
 *
 * Creates a new activity (quiz/exam/homework) for specific grade and sections
 * @param {Object} activityData - Activity data
 * @param {string} activityData.gradeId - Grade ID (required)
 * @param {string[]} activityData.sectionIds - Section IDs array (required, min 1)
 * @param {string} activityData.title - Activity title
 * @param {string} activityData.type - Activity type ('quiz', 'exam', 'homework')
 * @param {number} activityData.time_limit - Time limit in minutes
 * @param {number} activityData.max_score - Maximum score
 * @param {string} activityData.classId - Legacy class ID (deprecated, for backward compatibility)
 */
export const createActivity = async (activityData) => {
  try {
    // Support legacy signature: createActivity(classId, activityData)
    let data;
    if (typeof activityData === "string") {
      const classId = activityData;
      const legacyData = arguments[1];
      data = {
        class_id: classId,
        title: legacyData.title,
        type: legacyData.type,
        time_limit: legacyData.time_limit || null,
        max_score: legacyData.max_score || 100,
      };
    } else {
      // New signature: createActivity(activityData)
      if (!activityData.gradeId) {
        throw new Error("Grade ID is required");
      }
      if (!activityData.sectionIds || activityData.sectionIds.length === 0) {
        throw new Error("At least one section is required");
      }

      data = {
        grade_id: activityData.gradeId,
        section_ids: activityData.sectionIds,
        title: activityData.title,
        type: activityData.type, // 'quiz', 'exam', or 'homework'
        time_limit: activityData.time_limit || null,
        max_score: activityData.max_score || 100,
      };

      // Legacy support: include class_id if provided
      if (activityData.classId) {
        data.class_id = activityData.classId;
      }
    }

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
/**
 * CREATE LESSON (Teacher)
 *
 * Creates a new lesson for specific grade and sections
 * @param {Object} lessonData - Lesson data
 * @param {string} lessonData.gradeId - Grade ID (required)
 * @param {string[]} lessonData.sectionIds - Section IDs array (required, min 1)
 * @param {string} lessonData.title - Lesson title
 * @param {string} lessonData.content - Lesson content
 * @param {File[]} files - File attachments (optional, max 5)
 * @param {string} lessonData.classId - Legacy class ID (deprecated, for backward compatibility)
 */
export const createLesson = async (lessonData, files = []) => {
  try {
    // Support legacy signature: createLesson(classId, lessonData, files)
    let formData = new FormData();

    if (typeof lessonData === "string") {
      // Legacy signature
      const classId = lessonData;
      const legacyData = arguments[1];
      const legacyFiles = arguments[2] || [];

      formData.append("class_id", classId);
      formData.append("title", legacyData.title);
      formData.append("content", legacyData.content || "");

      legacyFiles.forEach((file) => {
        formData.append("attachments", file);
      });
    } else {
      // New signature: createLesson(lessonData, files)
      if (!lessonData.gradeId) {
        throw new Error("Grade ID is required");
      }
      if (!lessonData.sectionIds || lessonData.sectionIds.length === 0) {
        throw new Error("At least one section is required");
      }

      formData.append("grade_id", lessonData.gradeId);

      // Append each section ID separately (PocketBase handles relation arrays)
      lessonData.sectionIds.forEach((sectionId) => {
        formData.append("section_ids", sectionId);
      });

      formData.append("title", lessonData.title);
      formData.append("content", lessonData.content || "");

      // Legacy support: include class_id if provided
      if (lessonData.classId) {
        formData.append("class_id", lessonData.classId);
      }

      // Add file attachments (up to 5 files)
      files.forEach((file) => {
        formData.append("attachments", file);
      });
    }

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
      requestKey: null,
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
      requestKey: null, // disable auto-cancellation
    });

    return records;
  } catch (error) {
    if (
      error?.isAbort ||
      error?.message?.includes("autocancelled") ||
      error?.message?.includes("aborted")
    ) {
      return [];
    }
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
      fields: "id,email,name,avatar",
      requestKey: null,
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
      requestKey: null,
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
      requestKey: null, // disable auto-cancellation
    });

    return records.map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name || { en: "", ar: "" },
      description: record.description || "",
      icon: record.icon || "",
      color: record.color || "#2196F3",
      isActive: record.is_active,
      created: formatDate(record.created),
      updated: formatDate(record.updated),
    }));
  } catch (error) {
    if (
      error?.isAbort ||
      error?.message?.includes("autocancelled") ||
      error?.message?.includes("aborted")
    ) {
      return [];
    }
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
      requestKey: null,
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
/**
 * CREATE COURSE/SUBJECT (Admin)
 *
 * Creates a new subject with bilingual name
 * @param {Object} courseData
 * @param {string} courseData.code - Subject code (e.g., "MATH", "SCI")
 * @param {string} courseData.nameEn - English name
 * @param {string} courseData.nameAr - Arabic name
 * @param {string} courseData.description - Description (optional)
 * @param {string} courseData.icon - Material icon name (optional)
 * @param {string} courseData.color - Hex color (optional, default #2196F3)
 */
export const createCourse = async (courseData) => {
  try {
    // Bilingual format - name is stored as JSON object by PocketBase
    const data = {
      code: courseData.code.toUpperCase(),
      name: {
        en: courseData.nameEn || courseData.code,
        ar: courseData.nameAr || courseData.code,
      },
      description: courseData.description || "",
      icon: courseData.icon || "school",
      color: courseData.color || "#2196F3",
      is_active: true,
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

// Export pb instance for direct access if needed
export { pb };

/**
 * ============================================================================
 * BILINGUAL DATA HELPERS
 * ============================================================================
 * These functions help transform data between backend format and frontend format
 */

/**
 * Get bilingual value from field
 * Handles both JSON objects and plain strings
 * @param {Object|string} field - The bilingual field or plain string
 * @param {string} language - Language code ('ar' or 'en')
 * @returns {string}
 */
export const getBilingualValue = (field, language = "ar") => {
  if (!field) return "";

  // If it's already a string, return it
  if (typeof field === "string") return field;

  // If it's a bilingual object, get the value
  if (typeof field === "object") {
    return field[language] || field.ar || field.en || "";
  }

  return "";
};

/**
 * Format field to bilingual object
 * Converts plain strings to bilingual format for frontend compatibility
 * @param {Object|string} field - The field value
 * @returns {Object} Bilingual object {ar: string, en: string}
 */
export const formatBilingualField = (field) => {
  if (!field) return { ar: "", en: "" };

  // Already bilingual
  if (typeof field === "object" && (field.ar || field.en)) {
    return field;
  }

  // Plain string - use for both languages
  if (typeof field === "string") {
    return { ar: field, en: field };
  }

  return { ar: "", en: "" };
};

/**
 * Transform PocketBase record to frontend format
 * Ensures all text fields are bilingual objects
 * @param {Object} record - PocketBase record
 * @param {Array<string>} bilingualFields - Field names to transform
 * @returns {Object} Transformed record
 */
export const transformRecordToFrontend = (
  record,
  bilingualFields = ["title", "content", "description", "subject"],
) => {
  if (!record) return null;

  const transformed = { ...record };

  bilingualFields.forEach((fieldName) => {
    if (record[fieldName] !== undefined) {
      transformed[fieldName] = formatBilingualField(record[fieldName]);
    }
  });

  return transformed;
};

/**
 * ============================================================================
 * NEW ENROLLMENT SYSTEM API FUNCTIONS
 * ============================================================================
 * Functions for the new grade/section-based enrollment system
 */

/**
 * FETCH GRADES (Classes Collection)
 *
 * Fetches all active grade levels for dropdowns
 * @returns {Promise<Array>} Array of grade records
 */
export const fetchGrades = async () => {
  try {
    const records = await pb.collection("classes").getFullList({
      filter: "is_active=true",
      sort: "display_order",
      requestKey: null,
    });

    return records.map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name || { en: "", ar: "" },
      displayOrder: record.display_order,
      isActive: record.is_active,
    }));
  } catch (error) {
    console.error("Error fetching grades:", error);
    throw new Error(`Failed to fetch grades: ${error.message}`);
  }
};

/**
 * FETCH SECTIONS BY GRADE
 *
 * Fetches sections filtered by grade (or all if gradeId is null)
 * @param {string|null} gradeId - Grade ID to filter by, or null for all
 * @returns {Promise<Array>} Array of section records
 */
export const fetchSectionsByGrade = async (gradeId = null) => {
  try {
    let filter = "is_active=true";
    if (gradeId) {
      filter += ` && grade='${gradeId}'`;
    }

    const records = await pb.collection("class_sections").getFullList({
      filter,
      expand: "grade",
      sort: "name",
      requestKey: null,
    });

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      gradeId: record.grade,
      grade: record.expand?.grade || null,
      maxStudents: record.max_students,
      isActive: record.is_active,
    }));
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw new Error(`Failed to fetch sections: ${error.message}`);
  }
};

/**
 * FETCH SUBJECTS (Courses Collection)
 *
 * Fetches all active subjects for teacher assignment
 * @returns {Promise<Array>} Array of subject records
 */
export const fetchSubjects = async () => {
  try {
    const records = await pb.collection("courses").getFullList({
      filter: "is_active=true",
      sort: "code",
      requestKey: null,
    });

    return records.map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name || { en: "", ar: "" },
      icon: record.icon || "",
      color: record.color || "#2196F3",
      isActive: record.is_active,
    }));
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw new Error(`Failed to fetch subjects: ${error.message}`);
  }
};

/**
 * CREATE STUDENT WITH ENROLLMENT
 *
 * Creates student user + profile with grade/section assignment in one operation
 * Validates that section belongs to grade before creating
 *
 * @param {Object} data - Student data
 * @param {string} data.email - Student email
 * @param {string} data.password - Password
 * @param {string} data.firstName - First name (English)
 * @param {string} data.lastName - Last name (English)
 * @param {string} data.firstNameAr - First name (Arabic) - REQUIRED
 * @param {string} data.lastNameAr - Last name (Arabic) - REQUIRED
 * @param {string} data.gradeId - Grade ID from classes collection
 * @param {string} data.sectionId - Section ID from class_sections collection
 * @param {string} data.parentPhone - Parent phone (optional)
 * @param {string} data.dateOfBirth - Date of birth (optional)
 * @returns {Promise<Object>} Created user record
 */
export const createStudentWithEnrollment = async (data) => {
  try {
    // 1. Validate required fields
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }
    if (!data.firstName || !data.lastName) {
      throw new Error("First name and last name are required");
    }
    if (!data.firstNameAr || !data.lastNameAr) {
      throw new Error("Arabic names are required");
    }
    if (!data.gradeId || !data.sectionId) {
      throw new Error("Grade and section are required");
    }

    // 2. Validate that section belongs to selected grade
    const section = await pb
      .collection("class_sections")
      .getOne(data.sectionId);
    if (section.grade !== data.gradeId) {
      throw new Error("Selected section does not belong to selected grade");
    }

    // 3. Create user account
    const userData = {
      email: data.email,
      password: data.password,
      passwordConfirm: data.password,
      role: "student",
      name: `${data.firstName} ${data.lastName}`,
      active: true,
    };

    let userRecord;
    try {
      userRecord = await pb.collection("users").create(userData);
    } catch (error) {
      throw new Error(`Failed to create user account: ${error.message}`);
    }

    // 4. Create user profile with grade/section
    const profileData = {
      user_id: userRecord.id,
      first_name: data.firstName,
      last_name: data.lastName,
      first_name_ar: data.firstNameAr,
      last_name_ar: data.lastNameAr,
      grade_id: data.gradeId,
      section_id: data.sectionId,
      parent_phone: data.parentPhone || "",
      date_of_birth: data.dateOfBirth || "",
      enrollment_date: new Date().toISOString().split("T")[0],
    };

    try {
      await pb.collection("user_profiles").create(profileData);
    } catch (error) {
      // Profile creation failed - attempt cleanup
      console.error("Profile creation failed, attempting cleanup...");
      try {
        await pb.collection("users").delete(userRecord.id);
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return {
      success: true,
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      firstName: data.firstName,
      lastName: data.lastName,
      gradeId: data.gradeId,
      sectionId: data.sectionId,
    };
  } catch (error) {
    console.error("Error creating student:", error);
    throw error; // Re-throw to preserve original error message
  }
};

/**
 * CREATE TEACHER WITH ASSIGNMENTS
 *
 * Creates teacher user + profile + subject assignments + grade/section assignments
 * Teacher account is created first, then assignments are attempted (best-effort)
 *
 * @param {Object} data - Teacher data
 * @param {string} data.email - Teacher email
 * @param {string} data.password - Password
 * @param {string} data.firstName - First name (English)
 * @param {string} data.lastName - Last name (English)
 * @param {string} data.firstNameAr - First name (Arabic) - REQUIRED
 * @param {string} data.lastNameAr - Last name (Arabic) - REQUIRED
 * @param {Array} data.subjectAssignments - Array of {subjectId, grades: [{gradeId, sectionIds: []}]}
 * @returns {Promise<Object>} Created user record with assignment results
 */
export const createTeacherWithAssignments = async (data) => {
  try {
    // 1. Validate required fields
    if (!data.email || !data.password) {
      throw new Error("Email and password are required");
    }
    if (!data.firstName || !data.lastName) {
      throw new Error("First name and last name are required");
    }
    if (!data.firstNameAr || !data.lastNameAr) {
      throw new Error("Arabic names are required");
    }
    if (!data.subjectAssignments || data.subjectAssignments.length === 0) {
      throw new Error("At least one subject assignment is required");
    }

    // 2. Validate assignment structure
    for (const assignment of data.subjectAssignments) {
      if (!assignment.subjectId) {
        throw new Error("Subject ID is required for all assignments");
      }
      if (!assignment.grades || assignment.grades.length === 0) {
        throw new Error(
          `At least one grade is required for subject ${assignment.subjectId}`,
        );
      }
      for (const grade of assignment.grades) {
        if (!grade.gradeId) {
          throw new Error("Grade ID is required");
        }
        if (!grade.sectionIds || grade.sectionIds.length === 0) {
          throw new Error(
            `At least one section is required for grade ${grade.gradeId}`,
          );
        }
      }
    }

    // 3. Create user account
    const userData = {
      email: data.email,
      password: data.password,
      passwordConfirm: data.password,
      role: "teacher",
      active: true,
      name: `${data.firstName} ${data.lastName}`,
    };

    let userRecord;
    try {
      userRecord = await pb.collection("users").create(userData);
    } catch (error) {
      throw new Error(`Failed to create user account: ${error.message}`);
    }

    // 4. Create user profile
    const profileData = {
      user_id: userRecord.id,
      first_name: data.firstName,
      last_name: data.lastName,
      first_name_ar: data.firstNameAr,
      last_name_ar: data.lastNameAr,
    };

    try {
      await pb.collection("user_profiles").create(profileData);
    } catch (error) {
      // Profile creation failed - attempt cleanup
      console.error("Profile creation failed, attempting cleanup...");
      try {
        await pb.collection("users").delete(userRecord.id);
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    // 5. Attempt to create assignments (best-effort)
    const results = {
      success: true,
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      firstName: data.firstName,
      lastName: data.lastName,
      assignmentsCreated: 0,
      assignmentsFailed: 0,
      errors: [],
    };

    for (const assignment of data.subjectAssignments) {
      // Create teacher-subject relationship
      try {
        await pb.collection("teacher_subjects").create({
          teacher_id: userRecord.id,
          subject_id: assignment.subjectId,
        });
      } catch (error) {
        results.assignmentsFailed++;
        results.errors.push({
          type: "subject",
          subjectId: assignment.subjectId,
          error: error.message,
        });
        continue; // Skip grade/section assignments for this subject
      }

      // Create teacher-class assignments for each grade/section
      for (const gradeAssignment of assignment.grades) {
        for (const sectionId of gradeAssignment.sectionIds) {
          try {
            // Validate section belongs to grade
            const section = await pb
              .collection("class_sections")
              .getOne(sectionId);
            if (section.grade !== gradeAssignment.gradeId) {
              throw new Error("Section does not belong to selected grade");
            }

            await pb.collection("teacher_classes").create({
              teacher_id: userRecord.id,
              subject_id: assignment.subjectId,
              grade_id: gradeAssignment.gradeId,
              section_id: sectionId,
            });

            results.assignmentsCreated++;
          } catch (error) {
            results.assignmentsFailed++;
            results.errors.push({
              type: "class",
              subjectId: assignment.subjectId,
              gradeId: gradeAssignment.gradeId,
              sectionId: sectionId,
              error: error.message,
            });
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error creating teacher:", error);
    throw error; // Re-throw to preserve original error message
  }
};

/**
 * ============================================================================
 * USER DELETION SYSTEM (Two-Tier: Soft Delete + Hard Delete)
 * ============================================================================
 * Based on backend handoff documentation
 */

/**
 * GET USER DEPENDENCIES
 *
 * Checks what will be deleted when a user is removed
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} Dependencies summary
 */
export const getUserDependencies = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/dependencies`, {
      headers: {
        Authorization: pb.authStore.token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dependencies: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user dependencies:", error);
    throw new Error(`Failed to fetch user dependencies: ${error.message}`);
  }
};

/**
 * SOFT DELETE USER (Deactivation)
 *
 * Deactivates user account while preserving all data
 * @param {string} userId - User ID to deactivate
 * @returns {Promise<Object>} Success result
 */
export const softDeleteUser = async (userId) => {
  try {
    const response = await fetch(
      `/api/collections/users/records/${userId}?mode=soft`,
      {
        method: "DELETE",
        headers: {
          Authorization: pb.authStore.token,
        },
      },
    );

    // Soft delete returns 400 with success message (by design)
    if (!response.ok) {
      const error = await response.json();
      // Check if this is actually a success (message contains "successfully")
      if (
        error.message &&
        error.message.toLowerCase().includes("successfully")
      ) {
        return { success: true, message: error.message };
      }
      throw new Error(error.message || "Failed to deactivate user");
    }

    return { success: true };
  } catch (error) {
    // Check if error message indicates success
    if (error.message && error.message.toLowerCase().includes("successfully")) {
      return { success: true, message: error.message };
    }
    console.error("Error soft deleting user:", error);
    throw new Error(`Failed to deactivate user: ${error.message}`);
  }
};

/**
 * HARD DELETE USER (Permanent)
 *
 * Permanently deletes user and all dependencies (CANNOT BE UNDONE)
 * @param {string} userId - User ID to permanently delete
 * @returns {Promise<Object>} Success result
 */
export const hardDeleteUser = async (userId) => {
  try {
    const response = await fetch(
      `/api/collections/users/records/${userId}?mode=hard`,
      {
        method: "DELETE",
        headers: {
          Authorization: pb.authStore.token,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to permanently delete user");
    }

    return { success: true };
  } catch (error) {
    console.error("Error hard deleting user:", error);
    throw new Error(`Failed to permanently delete user: ${error.message}`);
  }
};

/**
 * REASSIGN CLASSES
 *
 * Reassigns classes from one teacher to another
 * @param {string} oldTeacherId - Current teacher ID
 * @param {string} newTeacherId - New teacher ID
 * @param {Array<string>} classIds - Optional: specific class IDs to reassign
 * @returns {Promise<Object>} Reassignment result
 */
export const reassignClasses = async (
  oldTeacherId,
  newTeacherId,
  classIds = [],
) => {
  try {
    const response = await fetch("/api/classes/reassign", {
      method: "POST",
      headers: {
        Authorization: pb.authStore.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old_teacher_id: oldTeacherId,
        new_teacher_id: newTeacherId,
        class_ids: classIds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reassign classes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error reassigning classes:", error);
    throw new Error(`Failed to reassign classes: ${error.message}`);
  }
};

/**
 * REACTIVATE USER
 *
 * Reactivates a soft-deleted user
 * @param {string} userId - User ID to reactivate
 * @returns {Promise<Object>} Reactivation result
 */
export const reactivateUser = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/reactivate`, {
      method: "POST",
      headers: {
        Authorization: pb.authStore.token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reactivate user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error reactivating user:", error);
    throw new Error(`Failed to reactivate user: ${error.message}`);
  }
};
