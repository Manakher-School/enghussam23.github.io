import PocketBase from 'pocketbase';
export const pb = new PocketBase('http://127.0.0.1:8090');

import { pb } from './lib/pocketbase';

// Login
await pb.collection('users').authWithPassword('student@school.com', 'student123');

// Check if logged in
console.log(pb.authStore.isValid); // true/false
console.log(pb.authStore.model.role); // student, teacher, or admin

// Logout
pb.authStore.clear();

// Get enrolled classes (student)
const enrollments = await pb.collection('enrollments').getFullList({
  filter: `student_id='${pb.authStore.model.id}' && status='active'`,
  expand: 'class_id.course_id'
});

// Get lessons
const lessons = await pb.collection('lessons').getFullList({
  filter: `class_id='YOUR_CLASS_ID'`
});

// Submit quiz answers
const submission = await pb.collection('submissions').create({
  activity_id: 'ACTIVITY_ID',
  student_id: pb.authStore.model.id,
  answers: {
    'question_id_1': '4',
    'question_id_2': true
  }
});
console.log('Score:', submission.score); // Auto-calculated!

const lesson = await pb.collection('lessons').getOne('lesson_id');
const pdfUrl = pb.files.getUrl(lesson, lesson.attachments[0]);
// Use in: <a href={pdfUrl}>Download</a>
