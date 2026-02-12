/**
 * Data Migration Script
 * Migrates mock JSON data to PostgreSQL database
 *
 * Prerequisites:
 * - PostgreSQL database created and schema.sql executed
 * - npm install pg dotenv
 * - .env file configured with database credentials
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "school_db",
  user: process.env.DB_USER || "school_admin",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Load JSON data files
const homeworkData = require("../src/data/homework.json");
const materialsData = require("../src/data/materials.json");
const newsData = require("../src/data/news.json");
const quizzesData = require("../src/data/quizzes.json");

/**
 * Helper: Get subject ID by name
 */
async function getSubjectId(subjectNameEn) {
  const result = await pool.query(
    "SELECT id FROM subjects WHERE name_en = $1",
    [subjectNameEn],
  );
  return result.rows[0]?.id;
}

/**
 * Helper: Get grade ID by code
 */
async function getGradeId(gradeCode) {
  const result = await pool.query("SELECT id FROM grades WHERE code = $1", [
    gradeCode,
  ]);
  return result.rows[0]?.id;
}

/**
 * Helper: Create a teacher user if not exists
 */
async function getOrCreateTeacher(username = "default_teacher") {
  let result = await pool.query("SELECT id FROM users WHERE username = $1", [
    username,
  ]);

  if (result.rows.length === 0) {
    // Create teacher user
    const teacherRoleId = await pool.query(
      "SELECT id FROM roles WHERE name = $1",
      ["teacher"],
    );

    result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        username,
        `${username}@school.edu`,
        "temporary_hash",
        teacherRoleId.rows[0].id,
      ],
    );

    // Create profile
    await pool.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name, first_name_ar, last_name_ar)
       VALUES ($1, $2, $3, $4, $5)`,
      [result.rows[0].id, "Teacher", "Account", "معلم", "افتراضي"],
    );

    console.log(`✅ Created teacher user: ${username}`);
  }

  return result.rows[0].id;
}

/**
 * 1. Migrate Homework
 */
async function migrateHomework() {
  console.log("\n📝 Migrating Homework...");
  let count = 0;

  const teacherId = await getOrCreateTeacher("homework_teacher");

  for (const hw of homeworkData) {
    try {
      const subjectId = await getSubjectId(hw.subject.en);
      const gradeId = await getGradeId(hw.grade);

      if (!subjectId || !gradeId) {
        console.warn(
          `⚠️  Skipping homework ${hw.id}: Missing subject or grade`,
        );
        continue;
      }

      await pool.query(
        `INSERT INTO homework (
          id, title_ar, title_en, content_ar, content_en,
          subject_id, grade_id, teacher_id, due_date,
          allow_file_submission, allow_text_submission,
          is_published, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING`,
        [
          hw.id,
          hw.title.ar,
          hw.title.en,
          hw.content.ar,
          hw.content.en,
          subjectId,
          gradeId,
          teacherId,
          hw.dueDate,
          hw.allowFileSubmission,
          hw.allowTextSubmission,
          true, // is_published
          hw.createdAt,
        ],
      );

      count++;
    } catch (error) {
      console.error(`❌ Error migrating homework ${hw.id}:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} homework items`);
}

/**
 * 2. Migrate Materials
 */
async function migrateMaterials() {
  console.log("\n📚 Migrating Materials...");
  let count = 0;

  const teacherId = await getOrCreateTeacher("materials_teacher");

  for (const mat of materialsData) {
    try {
      const subjectId = await getSubjectId(mat.subject.en);
      const gradeId = await getGradeId(mat.grade);

      if (!subjectId || !gradeId) {
        console.warn(
          `⚠️  Skipping material ${mat.id}: Missing subject or grade`,
        );
        continue;
      }

      await pool.query(
        `INSERT INTO materials (
          id, title_ar, title_en, content_ar, content_en,
          description_ar, description_en, subject_id, grade_id, teacher_id,
          file_type, file_url, file_size_kb, is_published, upload_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO NOTHING`,
        [
          mat.id,
          mat.title.ar,
          mat.title.en,
          mat.content.ar,
          mat.content.en,
          mat.description.ar,
          mat.description.en,
          subjectId,
          gradeId,
          teacherId,
          mat.fileType,
          mat.fileUrl,
          parseInt(mat.fileSize) || 0,
          true, // is_published
          mat.uploadDate,
        ],
      );

      count++;
    } catch (error) {
      console.error(`❌ Error migrating material ${mat.id}:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} materials`);
}

/**
 * 3. Migrate News
 */
async function migrateNews() {
  console.log("\n📰 Migrating News...");
  let count = 0;

  const authorId = await getOrCreateTeacher("news_admin");

  for (const article of newsData) {
    try {
      const result = await pool.query(
        `INSERT INTO news (
          id, title_ar, title_en, content_ar, content_en,
          category_ar, category_en, author_id, is_important,
          is_published, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
        RETURNING id`,
        [
          article.id,
          article.title.ar,
          article.title.en,
          article.content.ar,
          article.content.en,
          article.category.ar,
          article.category.en,
          authorId,
          article.important || false,
          true, // is_published
          article.publishedAt,
        ],
      );

      // Add news image if exists
      if (article.imageUrl && result.rows.length > 0) {
        await pool.query(
          `INSERT INTO news_images (news_id, image_url, display_order)
           VALUES ($1, $2, $3)`,
          [result.rows[0].id, article.imageUrl, 1],
        );
      }

      count++;
    } catch (error) {
      console.error(`❌ Error migrating news ${article.id}:`, error.message);
    }
  }

  console.log(`✅ Migrated ${count} news articles`);
}

/**
 * 4. Migrate Quizzes
 */
async function migrateQuizzes() {
  console.log("\n📋 Migrating Quizzes...");
  let quizCount = 0;
  let questionCount = 0;

  const teacherId = await getOrCreateTeacher("quiz_teacher");

  for (const quiz of quizzesData) {
    try {
      const subjectId = await getSubjectId(quiz.subject.en);
      const gradeId = await getGradeId(quiz.grade);

      if (!subjectId || !gradeId) {
        console.warn(`⚠️  Skipping quiz ${quiz.id}: Missing subject or grade`);
        continue;
      }

      // Insert quiz
      const quizResult = await pool.query(
        `INSERT INTO quizzes (
          id, title_ar, title_en, subject_id, grade_id, teacher_id,
          quiz_date, duration_minutes, total_points, is_published
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
        RETURNING id`,
        [
          quiz.id,
          quiz.title.ar,
          quiz.title.en,
          subjectId,
          gradeId,
          teacherId,
          quiz.date,
          quiz.duration,
          quiz.totalPoints,
          true, // is_published
        ],
      );

      if (quizResult.rows.length === 0) {
        continue; // Quiz already exists
      }

      quizCount++;

      // Insert questions
      if (quiz.questions && Array.isArray(quiz.questions)) {
        for (let i = 0; i < quiz.questions.length; i++) {
          const q = quiz.questions[i];

          const questionResult = await pool.query(
            `INSERT INTO questions (
              quiz_id, question_text_ar, question_text_en,
              question_type, points, correct_answer_index, display_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
              quiz.id,
              q.question.ar,
              q.question.en,
              "multiple_choice",
              q.points || 1,
              q.correctAnswer,
              i + 1,
            ],
          );

          const questionId = questionResult.rows[0].id;

          // Insert question options
          if (q.options && Array.isArray(q.options)) {
            for (let j = 0; j < q.options.length; j++) {
              const opt = q.options[j];
              await pool.query(
                `INSERT INTO question_options (
                  question_id, option_text_ar, option_text_en, option_order
                ) VALUES ($1, $2, $3, $4)`,
                [questionId, opt.ar, opt.en, j],
              );
            }
          }

          questionCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error migrating quiz ${quiz.id}:`, error.message);
    }
  }

  console.log(
    `✅ Migrated ${quizCount} quizzes with ${questionCount} questions`,
  );
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("🚀 Starting data migration...\n");
  console.log("Database:", process.env.DB_NAME);
  console.log("Host:", process.env.DB_HOST || "localhost");

  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Run migrations in order
    await migrateHomework();
    await migrateMaterials();
    await migrateNews();
    await migrateQuizzes();

    console.log("\n✅ Migration completed successfully!");

    // Show summary
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM homework) as homework_count,
        (SELECT COUNT(*) FROM materials) as materials_count,
        (SELECT COUNT(*) FROM news) as news_count,
        (SELECT COUNT(*) FROM quizzes) as quizzes_count,
        (SELECT COUNT(*) FROM questions) as questions_count
    `);

    console.log("\n📊 Database Summary:");
    console.table(summary.rows[0]);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Rollback function (clears migrated data)
 */
async function rollback() {
  console.log("⚠️  Rolling back migration...");

  try {
    await pool.query("BEGIN");

    await pool.query("DELETE FROM question_options");
    await pool.query("DELETE FROM questions");
    await pool.query("DELETE FROM quizzes");
    await pool.query("DELETE FROM news_images");
    await pool.query("DELETE FROM news");
    await pool.query("DELETE FROM materials");
    await pool.query("DELETE FROM homework");
    await pool.query(
      `DELETE FROM users WHERE username LIKE '%_teacher' OR username = 'news_admin'`,
    );

    await pool.query("COMMIT");

    console.log("✅ Rollback completed");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("❌ Rollback failed:", error);
  } finally {
    await pool.end();
  }
}

// Run migration or rollback based on command line argument
const command = process.argv[2];

if (command === "rollback") {
  rollback();
} else {
  migrate();
}
