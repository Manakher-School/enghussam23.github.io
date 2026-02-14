/**
 * PocketBase Data Service
 *
 * This service layer abstracts PocketBase API calls and maps backend data
 * to match the frontend's expected structure.
 *
 * Mapping Logic:
 * - Homework: activities collection where type='homework'
 * - Quizzes: activities collection where type='quiz'
 * - Materials: lessons collection (attachments mapped to frontend structure)
 * - News: news collection (new)
 */

import { pb } from "../lib/pocketbase";

/**
 * Helper: Get current language from i18next or default to 'ar'
 */
export const getCurrentLanguage = () => {
  // You can import i18next here if needed
  // import i18n from '../i18n';
  // return i18n.language || 'ar';
  return localStorage.getItem("i18nextLng") || "ar";
};

/**
 * Helper: Extract bilingual value based on current language
 * @param {Object} bilingualObj - Object with {ar: "...", en: "..."}
 * @param {string} lang - Language code ('ar' or 'en')
 * @returns {string}
 */
export const getBilingualValue = (bilingualObj, lang = null) => {
  if (!bilingualObj) return "";
  const currentLang = lang || getCurrentLanguage();
  return bilingualObj[currentLang] || bilingualObj["ar"] || "";
};

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
 * FETCH HOMEWORK
 *
 * Queries: activities collection where type='homework'
 * Maps to frontend homework structure
 */
export const fetchHomework = async (grade = null) => {
  try {
    let filter = "type='homework'";

    if (grade) {
      filter += ` && grade='${grade}'`;
    }

    const records = await pb.collection("activities").getFullList({
      filter: filter,
      sort: "-created",
      expand: "class_id", // Optional: if you want to expand relations
    });

    // Map to frontend structure
    return records.map((record) => ({
      id: record.id,
      title: record.title, // Already JSON: {ar: "...", en: "..."}
      content: record.content || record.description, // Bilingual JSON
      subject: record.subject || { ar: "عام", en: "General" },
      grade: record.grade || grade,
      dueDate: record.due_date ? formatDate(record.due_date) : null,
      createdAt: formatDate(record.created),
      type: "homework",
      allowFileSubmission: record.allow_file_submission ?? true,
      allowTextSubmission: record.allow_text_submission ?? true,
      // Additional fields you might have
      points: record.points || 0,
      attachments: record.attachments || [],
    }));
  } catch (error) {
    console.error("Error fetching homework:", error);
    throw new Error(`Failed to fetch homework: ${error.message}`);
  }
};

/**
 * FETCH QUIZZES
 *
 * Queries: activities collection where type='quiz'
 * Maps to frontend quiz structure
 */
export const fetchQuizzes = async (grade = null) => {
  try {
    let filter = "type='quiz'";

    if (grade) {
      filter += ` && grade='${grade}'`;
    }

    const records = await pb.collection("activities").getFullList({
      filter: filter,
      sort: "-created",
    });

    // Map to frontend structure
    return records.map((record) => ({
      id: record.id,
      title: record.title, // Bilingual JSON
      content: record.content || record.description,
      subject: record.subject || { ar: "عام", en: "General" },
      grade: record.grade || grade,
      dueDate: record.due_date ? formatDate(record.due_date) : null,
      createdAt: formatDate(record.created),
      type: "quiz",
      duration: record.duration || 30, // Duration in minutes
      totalPoints: record.points || 100,
      questions: record.questions || [], // JSON array of questions
      // Additional quiz-specific fields
      passingScore: record.passing_score || 60,
      allowRetake: record.allow_retake ?? false,
    }));
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw new Error(`Failed to fetch quizzes: ${error.message}`);
  }
};

/**
 * FETCH MATERIALS
 *
 * Queries: lessons collection
 * Maps attachments array to frontend materials structure
 */
export const fetchMaterials = async (grade = null, subject = null) => {
  try {
    let filter = "";
    const filters = [];

    if (grade) {
      filters.push(`grade='${grade}'`);
    }

    if (subject) {
      // Assuming subject is stored as JSON like {ar: "رياضيات", en: "Math"}
      // You may need to adjust this based on your actual schema
      filters.push(`subject.en='${subject}' || subject.ar='${subject}'`);
    }

    filter = filters.length > 0 ? filters.join(" && ") : "";

    const records = await pb.collection("lessons").getFullList({
      filter: filter || undefined,
      sort: "-created",
    });

    // Map lessons to materials
    // Option 1: Each lesson becomes one material with multiple files
    const materials = records.map((record) => ({
      id: record.id,
      title: record.title, // Bilingual JSON
      content: record.content || record.description,
      subject: record.subject || { ar: "عام", en: "General" },
      grade: record.grade || grade,
      uploadDate: formatDate(record.created),
      type: "material",
      description: record.description || record.content,
      // Attachments handling
      files: (record.attachments || []).map((filename) => ({
        name: filename,
        url: getFileUrl(record, filename),
        type: getFileType(filename),
      })),
      // For backward compatibility with single-file structure
      fileUrl: record.attachments?.[0]
        ? getFileUrl(record, record.attachments[0])
        : null,
      fileType: record.attachments?.[0]
        ? getFileType(record.attachments[0])
        : null,
      fileSize: record.file_size || "Unknown",
    }));

    // Option 2: Flatten each attachment into a separate material (uncomment if preferred)
    /*
    const materials = [];
    records.forEach(record => {
      if (record.attachments && record.attachments.length > 0) {
        record.attachments.forEach((filename, index) => {
          materials.push({
            id: `${record.id}_${index}`,
            lessonId: record.id,
            title: record.title,
            content: record.content || record.description,
            subject: record.subject || { ar: "عام", en: "General" },
            grade: record.grade || grade,
            fileType: getFileType(filename),
            fileUrl: getFileUrl(record, filename),
            fileName: filename,
            uploadDate: formatDate(record.created),
            type: "material"
          });
        });
      }
    });
    */

    return materials;
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw new Error(`Failed to fetch materials: ${error.message}`);
  }
};

/**
 * FETCH NEWS
 *
 * Queries: news collection
 * Maps to frontend news structure with bilingual support
 */
export const fetchNews = async (grade = null, limit = null) => {
  try {
    let filter = "is_published=true";

    if (grade) {
      // News can be for all grades or specific grade
      filter += ` && (grade='' || grade='${grade}' || grade=null)`;
    }

    const options = {
      filter: filter,
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
      title: record.title, // Bilingual JSON {ar: "...", en: "..."}
      content: record.content, // Bilingual JSON
      excerpt:
        record.excerpt || getBilingualValue(record.content).substring(0, 200),
      category: record.category || "General",
      publishedAt: formatDate(record.created),
      type: "news",
      important: record.important || false,
      // Image handling
      imageUrl: record.image ? pb.files.getUrl(record, record.image) : null,
      imageThumbnail: record.image
        ? pb.files.getUrl(record, record.image, { thumb: "300x300" })
        : null,
      // Additional fields
      grade: record.grade || null,
      isPublished: record.is_published,
    }));

    return newsItems;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
};

/**
 * FETCH EXAMS SCHEDULE
 *
 * Queries: activities collection where type='exam'
 * Or a dedicated 'exams' collection if you have one
 */
export const fetchExams = async (grade = null) => {
  try {
    let filter = "type='exam'";

    if (grade) {
      filter += ` && grade='${grade}'`;
    }

    const records = await pb.collection("activities").getFullList({
      filter: filter,
      sort: "start_date", // Sort by exam date
    });

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      subject: record.subject,
      grade: record.grade || grade,
      date: record.start_date ? formatDate(record.start_date) : null,
      startTime: record.start_time || "08:00",
      endTime: record.end_time || "10:00",
      room: record.room || { ar: "غرفة الامتحانات", en: "Exam Room" },
      type: "exam",
      duration: record.duration || 120,
    }));
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw new Error(`Failed to fetch exams: ${error.message}`);
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
 * SUBMIT HOMEWORK
 *
 * Submit student homework to PocketBase
 */
export const submitHomework = async (homeworkId, studentId, submission) => {
  try {
    const data = {
      activity_id: homeworkId,
      student_id: studentId,
      submission_text: submission.text || "",
      submission_files: submission.files || [],
      submitted_at: new Date().toISOString(),
    };

    const record = await pb.collection("submissions").create(data);

    return {
      success: true,
      submissionId: record.id,
      message: "Homework submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting homework:", error);
    throw new Error(`Failed to submit homework: ${error.message}`);
  }
};

/**
 * SUBMIT QUIZ ANSWERS
 *
 * Submit student quiz answers to PocketBase
 */
export const submitQuiz = async (quizId, studentId, answers) => {
  try {
    const data = {
      activity_id: quizId,
      student_id: studentId,
      answers: answers, // JSON object with question_id: answer pairs
      submitted_at: new Date().toISOString(),
    };

    const record = await pb.collection("submissions").create(data);

    return {
      success: true,
      submissionId: record.id,
      score: record.score || 0, // Auto-calculated by PocketBase hook
      totalPoints: record.total_points || 100,
      message: "Quiz submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting quiz:", error);
    throw new Error(`Failed to submit quiz: ${error.message}`);
  }
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

// Export pb instance for direct access if needed
export { pb };
