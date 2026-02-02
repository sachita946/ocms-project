# Complete Postman Testing Guide - OCMS API

## Server Information
- **Base URL:** `http://localhost:3000`
- **API Base URL:** `http://localhost:3000/api`
- **Status:** Make sure server is running with `npm run dev`

---

## Table of Contents
1. [Authentication Endpoints](#1-authentication-endpoints)
2. [Course Management Endpoints](#2-course-management-endpoints)
3. [Enrollment Endpoints](#3-enrollment-endpoints)
4. [Payment Endpoints](#4-payment-endpoints)
5. [Course Resources Endpoints](#5-course-resources-endpoints)
6. [Admin Endpoints](#6-admin-endpoints)
7. [Lesson & Quiz Endpoints](#7-lesson--quiz-endpoints)
8. [Profile & Dashboard Endpoints](#8-profile--dashboard-endpoints)
9. [Certificate Endpoints](#9-certificate-endpoints)
10. [Performance Endpoints](#10-performance-endpoints)
11. [Progress Endpoints](#11-progress-endpoints)
12. [Instructor Earnings Endpoints](#12-instructor-earnings-endpoints)
13. [Zoom Access Endpoints](#13-zoom-access-endpoints)
14. [OAuth Endpoints](#14-oauth-endpoints)
15. [Password Reset Endpoints](#15-password-reset-endpoints)
16. [Lesson Resources & Hierarchy Endpoints](#16-lesson-resources--hierarchy-endpoints)
17. [Video Notes Endpoints](#17-video-notes-endpoints)
18. [Notifications Endpoints](#18-notifications-endpoints)
19. [Activities Endpoints](#19-activities-endpoints)
20. [Reviews Endpoints](#20-reviews-endpoints)
21. [Complete Postman Collection](#21-complete-postman-collection)

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Student Signup
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/signup`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.student@example.com",
  "password": "Password123",
  "role": "STUDENT",
  "phone": "9841234567",
  "bio": "Eager to learn programming",
  "current_education_level": "Bachelor",
  "interests": ["JavaScript", "React", "Node.js"]
}
```

### 1.2 Instructor Signup
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/signup`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.instructor@example.com",
  "password": "Instructor123",
  "role": "INSTRUCTOR",
  "phone": "9841234567",
  "bio": "Experienced software engineer",
  "qualifications": "BS Computer Science",
  "experience_years": 5,
  "expertise_area": "Web Development",
  "website": "https://janesmith.com"
}
```

### 1.3 Login
**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.student@example.com",
  "password": "Password123"
}
```

**Save the token from response for authenticated requests!**

---

## 2. COURSE MANAGEMENT ENDPOINTS

### 2.1 Get All Published Courses
**Method:** `GET`  
**URL:** `http://localhost:3000/api/courses`  
**Headers:** None required (public endpoint)

### 2.2 Create Course (Instructor/Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/courses`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Request Body:**
```json
{
  "title": "Advanced Web Development with React",
  "description": "Learn modern React development techniques",
  "category": "Web Development",
  "level": "ADVANCED",
  "price": 15000,
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "promo_video_url": "https://youtu.be/dQw4w9WgXcQ",
  "zoom_link": "https://zoom.us/j/123456789",
  "requirements": ["Basic HTML/CSS", "JavaScript fundamentals"],
  "learning_outcomes": ["Build React applications", "State management", "API integration"],
  "duration_weeks": 8,
  "language": "English"
}
```

### 2.3 Get Instructor's Courses
**Method:** `GET`  
**URL:** `http://localhost:3000/api/courses/instructor/my-courses`  
**Headers:**
```
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

### 2.4 Update Course
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/courses/1` (replace 1 with course ID)  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "price": 20000,
  "is_published": true
}
```

### 2.5 Delete Course
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/courses/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## 3. ENROLLMENT ENDPOINTS

### 3.1 Enroll in Course
**Method:** `POST`  
**URL:** `http://localhost:3000/api/enrollments`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Request Body:**
```json
{
  "course_id": 1
}
```

**Note:** For paid courses, payment must be completed first!

### 3.2 Get My Enrollments
**Method:** `GET`  
**URL:** `http://localhost:3000/api/enrollments/me`  
**Headers:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

### 3.3 Get My Enrollments with Details
**Method:** `GET`  
**URL:** `http://localhost:3000/api/enrollments/me/details`  
**Headers:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

---

## 4. PAYMENT ENDPOINTS

### 4.1 Process Payment
**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Request Body:**
```json
{
  "course_id": 1,
  "amount": 15000,
  "payment_method": "ESEWA",
  "transaction_id": "TXN123456789",
  "status": "COMPLETED"
}
```

### 4.2 Get My Payments
**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments/me`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## 5. COURSE RESOURCES ENDPOINTS

### 5.1 Create Course Resource
**Method:** `POST`  
**URL:** `http://localhost:3000/api/course-resources`  
**Headers:**
```
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

**For Zoom Link:**
```json
{
  "course_id": 1,
  "type": "zoom",
  "title": "Live Session - Week 1",
  "content": "Join our first live session to discuss course overview",
  "zoom_link": "https://zoom.us/j/123456789"
}
```

**For Notes (with file upload):**
Use Form-Data instead of JSON:
```
course_id: 1
type: notes
title: Introduction Notes
content: These are the introduction notes
file: [Upload PDF file]
```

### 5.2 Get Course Resources
**Method:** `GET`  
**URL:** `http://localhost:3000/api/course-resources?courseId=1&type=notes`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 5.3 Get Public Resources
**Method:** `GET`  
**URL:** `http://localhost:3000/api/course-resources/public?courseId=1&type=notes`  
**Headers:** None required

### 5.4 Update Resource
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/course-resources/1`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

### 5.5 Delete Resource
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/course-resources/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## 5.6 CURRICULUM MANAGEMENT ENDPOINTS (Admin)

### 5.6.1 Add Notes to Course
**Method:** `POST`  
**URL:** `http://localhost:3000/api/course-resources`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Form-Data Body:**
```
course_id: 1
type: notes
title: Chapter 1 - Introduction to Programming
content: This chapter covers basic programming concepts including variables, data types, and control structures.
file: [Upload notes.pdf]
```

**Expected Response:**
```json
{
  "message": "Resource created successfully",
  "resource": {
    "id": 123,
    "course_id": 1,
    "type": "notes",
    "title": "Chapter 1 - Introduction to Programming",
    "content": "This chapter covers basic programming concepts...",
    "file_url": "/uploads/course-resources/123456789-notes.pdf",
    "file_type": "application/pdf",
    "user_id": 1
  }
}
```

### 5.6.2 Add Preboard Questions to Course
**Method:** `POST`  
**URL:** `http://localhost:3000/api/course-resources`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Form-Data Body:**
```
course_id: 2
type: preboard
title: Physics Preboard Set 1 - Mechanics
content: Practice questions covering Newton's laws, kinematics, and energy conservation.
file: [Upload physics_preboard.pdf]
```

### 5.6.3 Add Board Questions to Course
**Method:** `POST`  
**URL:** `http://localhost:3000/api/course-resources`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Form-Data Body:**
```
course_id: 3
type: board
title: Physics Board Questions 2079
content: Official board examination questions from 2079 with solutions.
file: [Upload 2079_board_physics.pdf]
```

### 5.6.4 Bulk Upload Curriculum Resources
**Method:** `POST` (Multiple requests)  
**URL:** `http://localhost:3000/api/course-resources`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Example 1 - Notes:**
```
course_id: 1
type: notes
title: Data Structures Notes
file: [Upload data_structures_notes.pdf]
```

**Example 2 - Preboard:**
```
course_id: 1
type: preboard
title: Data Structures Preboard Questions
file: [Upload data_structures_preboard.pdf]
```

**Example 3 - Board:**
```
course_id: 1
type: board
title: Data Structures Board Questions 2079
file: [Upload data_structures_board.pdf]
```

### 5.6.5 Get Curriculum Resources by Type
**Method:** `GET`  
**URL:** `http://localhost:3000/api/course-resources?courseId=1&type=notes`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
[
  {
    "id": 123,
    "course_id": 1,
    "type": "notes",
    "title": "Chapter 1 - Introduction to Programming",
    "content": "This chapter covers basic programming concepts...",
    "file_url": "/uploads/course-resources/123456789-notes.pdf",
    "file_type": "application/pdf",
    "created_at": "2026-01-29T10:00:00.000Z"
  }
]
```

### 5.6.6 Get All Curriculum Resources for Course
**Method:** `GET`  
**URL:** `http://localhost:3000/api/course-resources?courseId=1`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
[
  {
    "id": 123,
    "type": "notes",
    "title": "Chapter 1 - Introduction to Programming",
    "file_url": "/uploads/course-resources/notes.pdf"
  },
  {
    "id": 124,
    "type": "preboard",
    "title": "Programming Preboard Set 1",
    "file_url": "/uploads/course-resources/preboard.pdf"
  },
  {
    "id": 125,
    "type": "board",
    "title": "2079 Board Programming",
    "file_url": "/uploads/course-resources/board.pdf"
  }
]
```

### 5.6.7 Update Curriculum Resource
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/course-resources/123`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "title": "Updated Chapter 1 - Introduction to Programming",
  "content": "Updated content with additional examples"
}
```

### 5.6.8 Delete Curriculum Resource
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/course-resources/123`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 6. ADMIN ENDPOINTS

### 6.1 Get Admin Stats
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/stats`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 6.2 Get All Users
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/users`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 6.3 Get All Courses
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/courses`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 6.4 Get All Payments
**Method:** `GET`  
**URL:** `http://localhost:3000/api/admin/payments`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 6.5 Approve Instructor
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/admin/instructors/1/approve` (replace 1 with user ID)  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 6.6 Reject Instructor
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/admin/instructors/1/reject`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 7. LESSON & QUIZ ENDPOINTS

### 7.1 Get Course Lessons
**Method:** `GET`  
**URL:** `http://localhost:3000/api/lessons?courseId=1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 7.2 Create Lesson
**Method:** `POST`  
**URL:** `http://localhost:3000/api/lessons`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

**Request Body:**
```json
{
  "course_id": 1,
  "subject_id": 1,
  "title": "Introduction to React",
  "content_type": "VIDEO",
  "content_url": "https://example.com/video.mp4",
  "duration": 30
}
```

### 7.3 Get Quiz Questions
**Method:** `GET`  
**URL:** `http://localhost:3000/api/quizzes/lesson/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 7.4 Submit Quiz Answers
**Method:** `POST`  
**URL:** `http://localhost:3000/api/quizzes/submit`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Request Body:**
```json
{
  "lesson_id": 1,
  "answers": [
    {"question_id": 1, "answer": "A"},
    {"question_id": 2, "answer": "B"}
  ]
}
```

---

## 8. PROFILE & DASHBOARD ENDPOINTS

### 8.1 Get My Profile
**Method:** `GET`  
**URL:** `http://localhost:3000/api/profile/me`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 8.2 Update Profile
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/profile/me`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "bio": "Updated bio",
  "phone": "9841234567",
  "website": "https://example.com"
}
```

### 8.3 Get Student Dashboard
**Method:** `GET`  
**URL:** `http://localhost:3000/api/profile/student/dashboard`  
**Headers:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

---

## 9. CERTIFICATE ENDPOINTS

### 9.1 Issue Certificate
**Method:** `POST`  
**URL:** `http://localhost:3000/api/certificates/issue`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "user_id": 1,
  "course_id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "course_id": 1,
  "code": "ABC123DEF4",
  "issuedAt": "2026-01-29T10:00:00.000Z"
}
```

### 9.2 Verify Certificate
**Method:** `POST`  
**URL:** `http://localhost:3000/api/certificates/verify`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "ABC123DEF4"
}
```

**Response:**
```json
{
  "valid": true,
  "certificate": {
    "id": 1,
    "code": "ABC123DEF4",
    "issuedAt": "2026-01-29T10:00:00.000Z",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "course": {
      "id": 1,
      "title": "Advanced Web Development"
    }
  }
}
```

### 9.3 Create Certificate (Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/certificates`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "user_id": 1,
  "course_id": 1,
  "code": "CUSTOMCODE123"
}
```

### 9.4 List Certificates
**Method:** `GET`  
**URL:** `http://localhost:3000/api/certificates`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 9.5 Delete Certificate
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/certificates/1`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 10. PERFORMANCE ENDPOINTS

### 10.1 Get My Performance
**Method:** `GET`  
**URL:** `http://localhost:3000/api/performance/my`  
**Headers:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Response:**
```json
{
  "total_enrollments": 3,
  "total_certificates": 2,
  "average_score": 85.5,
  "course_stats": [
    {
      "course_id": 1,
      "title": "Advanced Web Development",
      "enrolled_at": "2026-01-15T00:00:00.000Z",
      "lessons_total": 12,
      "lessons_completed": 10,
      "quizzes_total": 8,
      "quizzes_passed": 6,
      "progress_percent": 83
    }
  ],
  "recent_attempts": [
    {
      "id": 1,
      "quiz_id": 1,
      "score": 85,
      "passed": true,
      "taken_at": "2026-01-29T09:00:00.000Z"
    }
  ]
}
```

---

## 11. PROGRESS ENDPOINTS

### 11.1 Mark Lesson Complete
**Method:** `POST`  
**URL:** `http://localhost:3000/api/progress`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Request Body:**
```json
{
  "enrollment_id": 1,
  "lesson_id": 1
}
```

### 11.2 Get Progress by Enrollment
**Method:** `GET`  
**URL:** `http://localhost:3000/api/progress/1` (enrollment ID)  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 11.3 Get Course Progress Stats (Instructor)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/progress/course/1/stats` (course ID)  
**Headers:**
```
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

### 11.4 Get All Students Progress (Admin)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/progress/all-students`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 12. INSTRUCTOR EARNINGS ENDPOINTS

### 12.1 Get My Earnings (Instructor)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/instructor-earnings/my-earnings`  
**Headers:**
```
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

### 12.2 Get Earnings by Course (Instructor)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/instructor-earnings/my-earnings/by-course`  
**Headers:**
```
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

### 12.3 Get All Instructor Earnings (Admin)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/instructor-earnings/all`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 12.4 Update Earning Status (Admin)
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/instructor-earnings/1/status`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "status": "PAID"
}
```

---

## 13. ZOOM ACCESS ENDPOINTS

### 13.1 Join Zoom Meeting (with Auth Checks)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/zoom/join/1` (course ID)  
**Headers:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Behavior:**
- For basic courses: Direct redirect to Zoom link
- For advanced courses: Checks enrollment and payment, then redirects
- Without auth: Redirects to login
- Without payment: Redirects to payment page

### 13.2 Get Zoom Access (API)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/zoom/access/1` (course ID)  
**Headers:**
```
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Response:**
```json
{
  "zoom_link": "https://zoom.us/j/123456789"
}
```

---

## 14. OAUTH ENDPOINTS

### 14.1 Google OAuth Login
**Method:** `GET`  
**URL:** `http://localhost:3000/api/oauth/google`  

**Redirects to Google OAuth consent screen**

### 14.2 Google OAuth Callback
**Method:** `GET`  
**URL:** `http://localhost:3000/api/oauth/google/callback`  

**Handles Google OAuth response and redirects to success page**

### 14.3 Facebook OAuth Login
**Method:** `GET`  
**URL:** `http://localhost:3000/api/oauth/facebook`  

**Redirects to Facebook OAuth consent screen**

### 14.4 Facebook OAuth Callback
**Method:** `GET`  
**URL:** `http://localhost:3000/api/oauth/facebook/callback`  

**Handles Facebook OAuth response and redirects to success page**

---

## 15. PASSWORD RESET ENDPOINTS

### 15.1 Forgot Password
**Method:** `POST`  
**URL:** `http://localhost:3000/api/password/forgot`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### 15.2 Reset Password
**Method:** `POST`  
**URL:** `http://localhost:3000/api/password/reset`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewPassword123"
}
```

---

## 16. LESSON RESOURCES & HIERARCHY ENDPOINTS

### 16.1 Get Lesson Resources
**Method:** `GET`  
**URL:** `http://localhost:3000/api/lesson-resources/lesson-resources`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
- `semester_id`: Filter by semester
- `subject_id`: Filter by subject
- `lesson_id`: Filter by lesson

### 16.2 Get Single Lesson Resource
**Method:** `GET`  
**URL:** `http://localhost:3000/api/lesson-resources/lesson-resources/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 16.3 Create Lesson Resource (Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/lesson-resources/lesson-resources`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Form-Data Body:**
```
semester_id: 1
subject_id: 1
lesson_id: 1
title: Introduction Notes
content: Basic introduction content
file: [Upload file]
```

### 16.4 Update Lesson Resource
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/lesson-resources/lesson-resources/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 16.5 Delete Lesson Resource
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/lesson-resources/lesson-resources/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 16.6 Get All Semesters
**Method:** `GET`  
**URL:** `http://localhost:3000/api/lesson-resources/semesters`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 16.7 Get Subjects by Semester
**Method:** `GET`  
**URL:** `http://localhost:3000/api/lesson-resources/subjects?semester_id=1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 16.8 Get Lessons by Subject
**Method:** `GET`  
**URL:** `http://localhost:3000/api/lesson-resources/lessons?subject_id=1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 16.9 Create Semester (Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/lesson-resources/semesters`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "name": "Semester 1",
  "description": "First semester"
}
```

### 16.10 Create Subject (Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/lesson-resources/subjects`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "name": "Mathematics",
  "semester_id": 1,
  "description": "Basic mathematics"
}
```

### 16.11 Create Lesson (Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/lesson-resources/lessons`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "title": "Algebra Basics",
  "subject_id": 1,
  "content": "Introduction to algebra",
  "order": 1
}
```

---

## 17. VIDEO NOTES ENDPOINTS

### 17.1 Add Video Note
**Method:** `POST`  
**URL:** `http://localhost:3000/api/videonotes`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "lesson_id": 1,
  "note": "Important concept at 5:30",
  "timestamp": 330
}
```

### 17.2 Get Video Notes
**Method:** `GET`  
**URL:** `http://localhost:3000/api/videonotes?lesson_id=1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 17.3 Update Video Note
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/videonotes/1`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "note": "Updated note content",
  "timestamp": 350
}
```

### 17.4 Delete Video Note
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/videonotes/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

---

## 18. NOTIFICATIONS ENDPOINTS

### 18.1 Get My Notifications
**Method:** `GET`  
**URL:** `http://localhost:3000/api/notifications/me`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 18.2 Mark Notification as Read
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/notifications/1/read`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 18.3 Create Notification (Admin)
**Method:** `POST`  
**URL:** `http://localhost:3000/api/notifications`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Request Body:**
```json
{
  "user_id": 1,
  "title": "Course Update",
  "message": "New lesson added to your course",
  "type": "INFO"
}
```

### 18.4 Get All Notifications (Admin)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/notifications`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 19. ACTIVITIES ENDPOINTS

### 19.1 Log Activity
**Method:** `POST`  
**URL:** `http://localhost:3000/api/activities`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "lesson_id": 1,
  "course_id": 1,
  "action": "viewed_lesson"
}
```

### 19.2 Get My Activities
**Method:** `GET`  
**URL:** `http://localhost:3000/api/activities/me`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 19.3 Get Course Activities (Instructor)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/activities/course/1`  
**Headers:**
```
Authorization: Bearer YOUR_INSTRUCTOR_TOKEN
```

### 19.4 Get All Activities (Admin)
**Method:** `GET`  
**URL:** `http://localhost:3000/api/activities`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 20. REVIEWS ENDPOINTS

### 20.1 Get Course Reviews
**Method:** `GET`  
**URL:** `http://localhost:3000/api/reviews?course_id=1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 20.2 Create Review
**Method:** `POST`  
**URL:** `http://localhost:3000/api/reviews`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_STUDENT_TOKEN
```

**Request Body:**
```json
{
  "course_id": 1,
  "rating": 5,
  "review_text": "Excellent course!",
  "is_anonymous": false
}
```

### 20.3 Update Review
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/reviews/1`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

### 20.4 Delete Review
**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/reviews/1`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### 20.5 Approve Review (Admin)
**Method:** `PUT`  
**URL:** `http://localhost:3000/api/reviews/1/approve`  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 21. COMPLETE POSTMAN COLLECTION JSON

```json
{
  "info": {
    "name": "OCMS Complete API Collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "student_token",
      "value": ""
    },
    {
      "key": "instructor_token",
      "value": ""
    },
    {
      "key": "admin_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Student Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"Password123\",\"role\":\"STUDENT\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/signup",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "signup"]
            }
          }
        },
        {
          "name": "Instructor Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"first_name\":\"Jane\",\"last_name\":\"Smith\",\"email\":\"jane@example.com\",\"password\":\"Instructor123\",\"role\":\"INSTRUCTOR\",\"qualifications\":\"BS Computer Science\",\"experience_years\":5}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/signup",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "signup"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"john@example.com\",\"password\":\"Password123\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Courses",
      "item": [
        {
          "name": "Get All Courses",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/courses",
              "host": ["{{base_url}}"],
              "path": ["api", "courses"]
            }
          }
        },
        {
          "name": "Create Course",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{instructor_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"title\":\"Advanced React\",\"description\":\"Learn React\",\"category\":\"Web Development\",\"level\":\"ADVANCED\",\"price\":15000,\"zoom_link\":\"https://zoom.us/j/123\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/courses",
              "host": ["{{base_url}}"],
              "path": ["api", "courses"]
            }
          }
        }
      ]
    },
    {
      "name": "Enrollments",
      "item": [
        {
          "name": "Enroll in Course",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"course_id\":1}"
            },
            "url": {
              "raw": "{{base_url}}/api/enrollments",
              "host": ["{{base_url}}"],
              "path": ["api", "enrollments"]
            }
          }
        },
        {
          "name": "Get My Enrollments",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/enrollments/me",
              "host": ["{{base_url}}"],
              "path": ["api", "enrollments", "me"]
            }
          }
        }
      ]
    },
    {
      "name": "Payments",
      "item": [
        {
          "name": "Process Payment",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"course_id\":1,\"amount\":15000,\"payment_method\":\"ESEWA\",\"transaction_id\":\"TXN123\",\"status\":\"COMPLETED\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/payments",
              "host": ["{{base_url}}"],
              "path": ["api", "payments"]
            }
          }
        }
      ]
    },
    {
      "name": "Course Resources",
      "item": [
        {
          "name": "Create Zoom Resource",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{instructor_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"course_id\":1,\"type\":\"zoom\",\"title\":\"Live Session\",\"content\":\"Join us\",\"zoom_link\":\"https://zoom.us/j/123\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/course-resources",
              "host": ["{{base_url}}"],
              "path": ["api", "course-resources"]
            }
          }
        },
        {
          "name": "Get Course Resources",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/course-resources?courseId=1&type=zoom",
              "host": ["{{base_url}}"],
              "path": ["api", "course-resources"],
              "query": [
                {
                  "key": "courseId",
                  "value": "1"
                },
                {
                  "key": "type",
                  "value": "zoom"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Get Admin Stats",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/admin/stats",
              "host": ["{{base_url}}"],
              "path": ["api", "admin", "stats"]
            }
          }
        },
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/admin/users",
              "host": ["{{base_url}}"],
              "path": ["api", "admin", "users"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 10. TESTING WORKFLOW

### Complete Testing Flow:

1. **Signup Users**
   - Create student account
   - Create instructor account  
   - Create admin account (if needed)

2. **Login & Get Tokens**
   - Login as each user type
   - Save tokens in Postman variables

3. **Create Course (Instructor)**
   - POST to `/api/courses` with zoom_link
   - Include YouTube URL for promo video

4. **Publish Course (Admin)**
   - PUT to `/api/courses/{id}` with `is_published: true`

5. **Student Enrollment Flow**
   - GET courses to see published ones
   - POST payment for paid courses
   - POST enrollment (should work after payment)

6. **Access Resources**
   - GET course resources to see zoom links
   - Test file downloads and zoom joins

### Common Issues & Solutions:

- **401 Unauthorized**: Check token is valid and not expired
- **403 Forbidden**: Verify user has correct role permissions
- **404 Not Found**: Check IDs exist in database
- **400 Bad Request**: Verify required fields are included
- **409 Conflict**: Resource already exists (duplicate email, etc.)

This collection covers all major OCMS API endpoints for complete testing of the course management system.
  "qualifications": "BS Computer Science, Master's in Education",
  "experience_years": 5,
  "expertise_area": "Web Development, Python, JavaScript",
  "phone": "9841234567",
  "website": "https://janesmith.com"
}
```

### Expected Success Response (201/200)
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "STUDENT",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Possible Error Responses

**Email Already Exists (409)**
```json
{
  "success": false,
  "message": "Email already exists",
  "data": null
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing fields",
  "data": null
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Server error",
  "data": null
}
```

---

## 2. LOGIN ENDPOINT

### Endpoint Details
- **URL:** `http://localhost:5500/api/auth/login`
- **Method:** `POST`
- **Content-Type:** `application/json`

### Headers to Set in Postman
```
Content-Type: application/json
```

### Request Body (Login Example)
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Expected Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "STUDENT",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Possible Error Responses

**Invalid Credentials (400)**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Missing fields",
  "data": null
}
```

---

## 3. Step-by-Step Postman Instructions

### For Signup:

1. **Create New Request**
   - Click "+" or "New"
   - Select "HTTP Request"

2. **Set Request Type**
   - Change from "GET" to "POST"

3. **Enter URL**
   - Paste: `http://localhost:5500/api/auth/signup`

4. **Set Headers**
   - Click "Headers" tab
   - Header: `Content-Type`
   - Value: `application/json`
   - (Postman usually auto-detects this)

5. **Add Body**
   - Click "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the request body:
   ```json
   {
     "first_name": "John",
     "last_name": "Doe",
     "email": "john@example.com",
     "password": "Password123",
     "role": "STUDENT"
   }
   ```

6. **Send Request**
   - Click "Send"
   - Check response in the panel below

7. **Save Token**
   - Copy the token from response
   - Save it for login testing

### For Login:

1. **Create New Request**
   - Click "+" or "New"
   - Select "HTTP Request"

2. **Set Request Type**
   - Change from "GET" to "POST"

3. **Enter URL**
   - Paste: `http://localhost:5500/api/auth/login`

4. **Set Headers**
   - Click "Headers" tab
   - Header: `Content-Type`
   - Value: `application/json`

5. **Add Body**
   - Click "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste the request body:
   ```json
   {
     "email": "john@example.com",
     "password": "Password123"
   }
   ```

6. **Send Request**
   - Click "Send"
   - Check response with token

---

## 4. Testing with Frontend Integration

### Test Signup Flow:

1. **Open Browser**
   - Go to: `http://localhost:5500/student/student-signup.html`

2. **Fill Form**
   - Full Name: John Doe
   - Email: john@example.com
   - Password: Password123
   - Confirm: Password123
   - Phone: 9841234567
   - Education: Bachelor's
   - Skills: JavaScript, React, Node.js

3. **Submit**
   - Click "Sign Up"
   - Check browser console (F12 → Console tab)
   - Should see success message with token

4. **Check Server Logs**
   - Terminal where server runs should show request logs
   - Look for: `signup` or POST request logs

### Test Login Flow:

1. **Open Browser**
   - Go to: `http://localhost:5500/auth/login.html`

2. **Fill Form**
   - Email: john@example.com
   - Password: Password123

3. **Submit**
   - Click "Log In"
   - Should show confirmation dialog
   - Click "Yes, Continue"
   - Check browser console for token
   - Should redirect to student dashboard

4. **Check Server Logs**
   - Terminal where server runs should show request logs
   - Look for: `login` or POST request logs

---

## 5. Verify Backend Connection

### Check if Request Reaches Backend:

**Method 1: Server Terminal**
```
Look for logs like:
- POST /api/auth/signup
- POST /api/auth/login
- Request received from frontend
```

**Method 2: Browser Network Tab**
1. Open DevTools (F12)
2. Go to "Network" tab
3. Submit signup/login form
4. Look for POST requests to:
   - `http://localhost:5500/api/auth/signup`
   - `http://localhost:5500/api/auth/login`
5. Click on request to see:
   - Request Headers
   - Request Body (what was sent)
   - Response Status (200, 400, 409, 500, etc.)
   - Response Body (server response)

**Method 3: Check Database**
```sql
SELECT * FROM "User" WHERE email = 'john@example.com';
```

---

## 6. Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:**
- Ensure server is running: `npm run dev`
- Check if port 5500 is listening
- Try: `http://localhost:5500` in browser

### Issue: "Email already exists"
**Solution:**
- Use a different email address
- Or delete the user from database and try again

### Issue: "Invalid credentials"
**Solution:**
- Check email spelling (case-sensitive)
- Password is case-sensitive
- Ensure password matches exactly

### Issue: "CORS Error"
**Solution:**
- Already handled in backend
- Should not occur with localhost
- If persists, check CORS middleware in index.js

### Issue: Response shows empty data
**Solution:**
- Check server logs for errors
- Ensure all required fields are sent
- Verify request headers have `Content-Type: application/json`

---

## 7. Testing Checklist

- [ ] Can signup a new student
- [ ] Cannot signup with existing email
- [ ] Passwords are hashed (not stored as plain text)
- [ ] Token is returned after signup
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Cannot login with non-existent email
- [ ] Student profile is created automatically
- [ ] Instructor profile is created with details
- [ ] Token can be used in subsequent requests
- [ ] Frontend form submission sends to backend
- [ ] Frontend receives and displays errors correctly
- [ ] Frontend shows success messages

---

## 8. Example Postman Collection

You can import this as a Postman collection:

```json
{
  "info": {
    "name": "OCMS Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signup - Student",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"first_name\":\"John\",\"last_name\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"Password123\",\"role\":\"STUDENT\"}"
        },
        "url": {
          "raw": "http://localhost:5500/api/auth/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5500",
          "path": ["api", "auth", "signup"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"john@example.com\",\"password\":\"Password123\"}"
        },
        "url": {
          "raw": "http://localhost:5500/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5500",
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

---

## 9. Frontend Error Message Updates

### Instructor Profile Page - Inline Error Messages

The instructor profile page (`/publicc/instructor/profile.html`) has been updated to display error messages inline instead of using popup alerts.

**Changes Made:**
- Added error message container: `<div id="errorMsg">` styled with red background
- Replaced all `alert()` calls with inline error display
- Network errors are now displayed inline with styling
- Success and error messages display together with proper styling

**Error Display Examples:**
```
Network Error:
- "Network error. Please try again." (red inline box)

Validation Error:
- "Passwords do not match!" (red inline box)

API Error:
- Server-provided error message displayed inline
- E.g., "Email already in use"
```

**Testing the Profile Update:**
1. Login as instructor with token
2. Go to `/instructor/profile.html`
3. Update any field (e.g., bio, expertise)
4. Click "Save Changes"
5. Watch for inline error/success messages

**If Network Error Occurs:**
- Red error message displays inline below the header
- User can see the specific error without a popup
- User can correct and resubmit without page refresh

---

## Questions?

- Check server logs: `npm run dev` output
- Check browser console: F12 → Console
- Check network requests: F12 → Network
- Read error messages carefully - they're descriptive!

---

## 10. ZOOM ACCESS FLOW TESTING

### Complete Zoom Access Flow Collection

```json
{
  "info": {
    "name": "OCMS Zoom Access Flow Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "student_token",
      "value": ""
    },
    {
      "key": "instructor_token",
      "value": ""
    },
    {
      "key": "admin_token",
      "value": ""
    },
    {
      "key": "course_id",
      "value": ""
    },
    {
      "key": "zoom_join_url",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "🔐 Authentication",
      "item": [
        {
          "name": "Student Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"first_name\":\"John\",\"last_name\":\"Student\",\"email\":\"john.zoom@example.com\",\"password\":\"Password123\",\"role\":\"STUDENT\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/signup",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "signup"]
            }
          }
        },
        {
          "name": "Instructor Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"first_name\":\"Jane\",\"last_name\":\"Instructor\",\"email\":\"jane.zoom@example.com\",\"password\":\"Instructor123\",\"role\":\"INSTRUCTOR\",\"qualifications\":\"MSc CS\",\"experience_years\":5,\"bio\":\"Zoom expert\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/signup",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "signup"]
            }
          }
        },
        {
          "name": "Student Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"john.zoom@example.com\",\"password\":\"Password123\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            },
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "if (pm.response.code === 200) {",
                    "    const response = pm.response.json();",
                    "    pm.collectionVariables.set('student_token', response.token);",
                    "}"
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "Instructor Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"jane.zoom@example.com\",\"password\":\"Instructor123\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            },
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "if (pm.response.code === 200) {",
                    "    const response = pm.response.json();",
                    "    pm.collectionVariables.set('instructor_token', response.token);",
                    "}"
                  ]
                }
              }
            ]
          }
        }
      ]
    },
    {
      "name": "📚 Course Management",
      "item": [
        {
          "name": "Create Advanced Course with Zoom",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{instructor_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"title\":\"Advanced React with Zoom Sessions\",\"description\":\"Master React with live Zoom coding sessions\",\"category\":\"Web Development\",\"level\":\"ADVANCED\",\"price\":15000,\"zoom_link\":\"https://zoom.us/j/123456789\",\"promo_video_url\":\"https://youtu.be/dQw4w9WgXcQ\",\"requirements\":[\"Basic JavaScript\"],\"learning_outcomes\":[\"React mastery\"],\"duration_weeks\":8,\"language\":\"English\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/courses",
              "host": ["{{base_url}}"],
              "path": ["api", "courses"]
            },
            "event": [
              {
                "listen": "test",
                "script": {
                  "exec": [
                    "if (pm.response.code === 201) {",
                    "    const response = pm.response.json();",
                    "    pm.collectionVariables.set('course_id', response.id);",
                    "}"
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "Publish Course (Admin)",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"is_published\":true}"
            },
            "url": {
              "raw": "{{base_url}}/api/courses/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "courses", "{{course_id}}"]
            }
          }
        },
        {
          "name": "Add Zoom Resource to Course",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{instructor_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"course_id\":{{course_id}},\"type\":\"zoom\",\"title\":\"Live Session - Week 1\",\"content\":\"Join our first live coding session\",\"zoom_link\":\"https://zoom.us/j/123456789\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/course-resources",
              "host": ["{{base_url}}"],
              "path": ["api", "course-resources"]
            }
          }
        }
      ]
    },
    {
      "name": "🎓 Enrollment & Payment",
      "item": [
        {
          "name": "Enroll in Advanced Course",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"course_id\":{{course_id}}}"
            },
            "url": {
              "raw": "{{base_url}}/api/enrollments",
              "host": ["{{base_url}}"],
              "path": ["api", "enrollments"]
            }
          }
        },
        {
          "name": "Process Payment for Course",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"course_id\":{{course_id}},\"amount\":15000,\"payment_method\":\"ESEWA\",\"transaction_id\":\"TXN-ZOOM-123\",\"status\":\"COMPLETED\"}"
            },
            "url": {
              "raw": "{{base_url}}/api/payments",
              "host": ["{{base_url}}"],
              "path": ["api", "payments"]
            }
          }
        }
      ]
    },
    {
      "name": "🎥 Zoom Access Testing",
      "item": [
        {
          "name": "❌ Try Zoom Access Without Auth (Should Redirect)",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/api/zoom/join/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "zoom", "join", "{{course_id}}"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "// Should redirect to login page",
                  "pm.test('Should redirect to login', function () {",
                  "    pm.response.to.have.status(302);",
                  "    const location = pm.response.headers.get('Location');",
                  "    pm.expect(location).to.include('/auth/login.html');",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "❌ Try Zoom Access Without Payment (Should Redirect)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/zoom/join/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "zoom", "join", "{{course_id}}"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "// Should redirect to payment page",
                  "pm.test('Should redirect to payment', function () {",
                  "    pm.response.to.have.status(302);",
                  "    const location = pm.response.headers.get('Location');",
                  "    pm.expect(location).to.include('/student/payment.html');",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "✅ Try Zoom Access With Payment (Should Succeed)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/zoom/join/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "zoom", "join", "{{course_id}}"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "// Should redirect to Zoom link",
                  "pm.test('Should redirect to Zoom', function () {",
                  "    pm.response.to.have.status(302);",
                  "    const location = pm.response.headers.get('Location');",
                  "    pm.expect(location).to.include('zoom.us');",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "🔍 Get Zoom Link Directly (API)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/zoom/access/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "zoom", "access", "{{course_id}}"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Should return Zoom link', function () {",
                  "    pm.response.to.have.status(200);",
                  "    const response = pm.response.json();",
                  "    pm.expect(response).to.have.property('zoom_link');",
                  "    pm.collectionVariables.set('zoom_join_url', response.zoom_link);",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "📋 Get Course Resources (Zoom Links)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/course-resources?courseId={{course_id}}&type=zoom",
              "host": ["{{base_url}}"],
              "path": ["api", "course-resources"],
              "query": [
                {
                  "key": "courseId",
                  "value": "{{course_id}}"
                },
                {
                  "key": "type",
                  "value": "zoom"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "name": "🧪 Edge Cases & Error Testing",
      "item": [
        {
          "name": "Try Access Non-existent Course",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/zoom/join/99999",
              "host": ["{{base_url}}"],
              "path": ["api", "zoom", "join", "99999"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Should return 404', function () {",
                  "    pm.response.to.have.status(404);",
                  "});"
                ]
              }
            }
          ]
        },
        {
          "name": "Try Access Unpublished Course",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{admin_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"is_published\":false}"
            },
            "url": {
              "raw": "{{base_url}}/api/courses/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "courses", "{{course_id}}"]
            }
          }
        },
        {
          "name": "Try Zoom Access on Unpublished Course",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{student_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/zoom/join/{{course_id}}",
              "host": ["{{base_url}}"],
              "path": ["api", "zoom", "join", "{{course_id}}"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test('Should return 404 for unpublished', function () {",
                  "    pm.response.to.have.status(404);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Testing Instructions for Zoom Access Flow:

## **Complete Testing Workflow:**

### **Phase 1: Setup**
1. **Run the server**: `npm run dev`
2. **Import the collection** into Postman
3. **Execute requests in order** (follow the numbered sequence)

### **Phase 2: Authentication Testing**
1. **Student Signup** → Should return token
2. **Instructor Signup** → Should return token  
3. **Student Login** → Store token in `student_token`
4. **Instructor Login** → Store token in `instructor_token`

### **Phase 3: Course Creation**
1. **Create Advanced Course** → Store `course_id`
2. **Publish Course** → Make course available
3. **Add Zoom Resource** → Add Zoom meeting link

### **Phase 4: Enrollment & Payment**
1. **Enroll in Course** → Student enrolls
2. **Process Payment** → Complete payment for access

### **Phase 5: Zoom Access Testing**
1. **❌ Without Auth** → Should redirect to login
2. **❌ Without Payment** → Should redirect to payment
3. **✅ With Payment** → Should redirect to Zoom
4. **🔍 Direct API Access** → Get Zoom link via API

### **Phase 6: Edge Cases**
1. **Non-existent Course** → 404 error
2. **Unpublish Course** → Make unavailable
3. **Access Unpublished** → 404 error

## **Expected Response Codes:**
- `302` → Redirect (login/payment/zoom)
- `200` → Success (API access)
- `404` → Not found (invalid/unpublished)
- `403` → Forbidden (not enrolled/paid)

## **Key Testing Points:**
- ✅ **Authentication flow** preserves return URLs
- ✅ **Payment required** for advanced courses
- ✅ **Direct Zoom access** for basic courses
- ✅ **Proper error handling** for edge cases
- ✅ **Security validation** prevents unauthorized access

This collection tests the complete Zoom access protection system for advanced courses!

---

## **📋 PRACTICAL TESTING SCENARIOS**

### **Scenario 1: Complete Curriculum Management Workflow**

#### **Step 1: Admin Login**
```
POST http://localhost:3000/api/auth/login
{
  "email": "admin@ocms.com",
  "password": "Admin123"
}
```
**Save token as:** `admin_token`

#### **Step 2: Create a Course (if needed)**
```
POST http://localhost:3000/api/courses
Authorization: Bearer {{admin_token}}
{
  "title": "Computer Science Fundamentals",
  "description": "Complete CS foundation course",
  "category": "Computer Science",
  "level": "ADVANCED",
  "price": 15000,
  "language": "English"
}
```
**Save course_id from response**

#### **Step 3: Add Notes**
```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{admin_token}}
Form-Data:
- course_id: {{course_id}}
- type: notes
- title: Chapter 1 - Introduction to CS
- content: This chapter covers basic computer science concepts
- file: [Upload chapter1_notes.pdf]
```

#### **Step 4: Add Preboard Questions**
```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{admin_token}}
Form-Data:
- course_id: {{course_id}}
- type: preboard
- title: CS Preboard Set 1
- content: Practice questions for CS fundamentals
- file: [Upload cs_preboard.pdf]
```

#### **Step 5: Add Board Questions**
```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{admin_token}}
Form-Data:
- course_id: {{course_id}}
- type: board
- title: 2079 Board Computer Science
- content: Official board exam questions
- file: [Upload 2079_board_cs.pdf]
```

#### **Step 6: Verify Resources Added**
```
GET http://localhost:3000/api/course-resources?courseId={{course_id}}
Authorization: Bearer {{admin_token}}
```

### **Scenario 2: Student Enrollment and Payment**

#### **Step 1: Student Login**
```
POST http://localhost:3000/api/auth/login
{
  "email": "student@ocms.com",
  "password": "Student123"
}
```
**Save token as:** `student_token`

#### **Step 2: Get Available Courses**
```
GET http://localhost:3000/api/courses
Authorization: Bearer {{student_token}}
```

#### **Step 3: Create Payment Intent**
```
POST http://localhost:3000/api/payments/create-intent
Authorization: Bearer {{student_token}}
{
  "course_id": {{course_id}},
  "amount": 15000
}
```

#### **Step 4: Confirm Payment (Simulate)**
```
POST http://localhost:3000/api/payments/confirm
Authorization: Bearer {{student_token}}
{
  "payment_intent_id": "pi_simulated_id",
  "payment_id": {{payment_id}}
}
```

#### **Step 5: Verify Enrollment**
```
GET http://localhost:3000/api/enrollments/me
Authorization: Bearer {{student_token}}
```

### **Scenario 3: Bulk Curriculum Upload**

#### **Step 1: Prepare Files with Naming Convention**
- `physics_notes.pdf` → Automatically categorized as notes
- `physics_preboard.pdf` → Automatically categorized as preboard
- `physics_board.pdf` → Automatically categorized as board

#### **Step 2: Bulk Upload (Multiple Requests)**
```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{admin_token}}
Form-Data:
- course_id: {{course_id}}
- type: notes
- title: Physics Notes - Mechanics
- file: [Upload physics_notes.pdf]
```

```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{admin_token}}
Form-Data:
- course_id: {{course_id}}
- type: preboard
- title: Physics Preboard Questions
- file: [Upload physics_preboard.pdf]
```

---

## **🔧 QUICK REFERENCE**

### **Authentication Tokens**
- **Admin:** `Bearer {{admin_token}}`
- **Instructor:** `Bearer {{instructor_token}}`
- **Student:** `Bearer {{student_token}}`

### **Common Course IDs**
- **Advanced Courses:** 1, 2, 3, 7, 8, 1001, 1004, 1005
- **Basic Courses:** Check `/api/courses` endpoint

### **File Upload Limits**
- **Max Size:** 10MB per file
- **Allowed Types:** PDF, JPG, JPEG, PNG
- **Storage:** `/publicc/uploads/course-resources/`

### **Resource Types**
- **notes:** Study materials and lecture notes
- **preboard:** Practice exam questions
- **board:** Official board examination papers
- **zoom:** Live session links

---

## **🚀 TESTING CHECKLIST**

### **Curriculum Management**
- [ ] Admin can add notes to courses
- [ ] Admin can add preboard questions
- [ ] Admin can add board questions
- [ ] File uploads work correctly
- [ ] Resources appear in course listings
- [ ] Students can access resources after enrollment

### **Payment Integration**
- [ ] Advanced courses require payment
- [ ] Payment intents create successfully
- [ ] Payment confirmation creates enrollment
- [ ] Students can access paid course content

### **Bulk Operations**
- [ ] Multiple file uploads work
- [ ] Auto-categorization functions
- [ ] Batch processing completes successfully

### **Error Handling**
- [ ] Invalid course IDs are rejected
- [ ] Missing files/content show proper errors
- [ ] Unauthorized access is prevented
- [ ] File size limits are enforced

---

## 22. COMPLETE TESTING WORKFLOW EXAMPLE

### **Example: Complete Student Journey from Signup to Certificate**

This example demonstrates testing the complete OCMS workflow for a student, from account creation to course completion and certification.

#### **Phase 1: User Registration & Authentication**

**1.1 Student Signup**
```
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice.student@example.com",
  "password": "Student123",
  "role": "STUDENT",
  "phone": "9841234567",
  "bio": "Aspiring software developer",
  "current_education_level": "Bachelor",
  "interests": ["JavaScript", "React", "Python"]
}
```
**Expected Response:** 201 Created with token
**Save token as:** `student_token`

**1.2 Student Login**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "alice.student@example.com",
  "password": "Student123"
}
```
**Expected Response:** 200 OK with token
**Verify token is the same as signup**

#### **Phase 2: Course Discovery & Enrollment**

**2.1 Browse Available Courses**
```
GET http://localhost:3000/api/courses
```
**Expected Response:** 200 OK with array of published courses
**Note course IDs for enrollment**

**2.2 Get Course Details (Optional)**
```
GET http://localhost:3000/api/courses/1
```
**Expected Response:** 200 OK with detailed course information

**2.3 Enroll in Basic Course (Free)**
```
POST http://localhost:3000/api/enrollments
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "course_id": 1
}
```
**Expected Response:** 201 Created
**Note enrollment ID for progress tracking**

**2.4 Enroll in Advanced Course (Paid)**
```
POST http://localhost:3000/api/enrollments
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "course_id": 2
}
```
**Expected Response:** 400 Bad Request (payment required)
**This should fail because advanced courses need payment first**

#### **Phase 3: Payment Processing**

**3.1 Process Payment for Advanced Course**
```
POST http://localhost:3000/api/payments
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "course_id": 2,
  "amount": 15000,
  "payment_method": "ESEWA",
  "transaction_id": "TXN_ADV_COURSE_001",
  "status": "COMPLETED"
}
```
**Expected Response:** 201 Created

**3.2 Now Enroll in Advanced Course (After Payment)**
```
POST http://localhost:3000/api/enrollments
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "course_id": 2
}
```
**Expected Response:** 201 Created

#### **Phase 4: Learning & Progress**

**4.1 Get My Enrollments**
```
GET http://localhost:3000/api/enrollments/me
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with enrolled courses

**4.2 Get Course Lessons**
```
GET http://localhost:3000/api/lessons?courseId=1
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with lessons array

**4.3 Mark Lesson as Complete**
```
POST http://localhost:3000/api/progress
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "enrollment_id": 1,
  "lesson_id": 1
}
```
**Expected Response:** 201 Created

**4.4 Get Progress Statistics**
```
GET http://localhost:3000/api/progress/1
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with progress details

#### **Phase 5: Course Resources & Materials**

**5.1 Get Course Resources**
```
GET http://localhost:3000/api/course-resources?courseId=1&type=notes
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with resources array

**5.2 Access Zoom Meeting**
```
GET http://localhost:3000/api/zoom/join/1
Authorization: Bearer {{student_token}}
```
**Expected Response:** 302 Redirect to Zoom link

**5.3 Add Video Note**
```
POST http://localhost:3000/api/videonotes
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "lesson_id": 1,
  "note": "Important concept at 3:45",
  "timestamp": 225
}
```
**Expected Response:** 201 Created

#### **Phase 6: Assessments & Quizzes**

**6.1 Get Quiz Questions**
```
GET http://localhost:3000/api/quizzes/lesson/1
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with questions array

**6.2 Submit Quiz Answers**
```
POST http://localhost:3000/api/quizzes/submit
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "lesson_id": 1,
  "answers": [
    {"question_id": 1, "answer": "A"},
    {"question_id": 2, "answer": "B"},
    {"question_id": 3, "answer": "C"}
  ]
}
```
**Expected Response:** 200 OK with score and results

#### **Phase 7: Reviews & Feedback**

**7.1 Create Course Review**
```
POST http://localhost:3000/api/reviews
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "course_id": 1,
  "rating": 5,
  "review_text": "Excellent course! Very comprehensive and well-structured.",
  "is_anonymous": false
}
```
**Expected Response:** 201 Created

**7.2 Get Course Reviews**
```
GET http://localhost:3000/api/reviews?course_id=1
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with reviews array

#### **Phase 8: Certification**

**8.1 Issue Certificate (Admin Action - Simulate)**
```
POST http://localhost:3000/api/certificates/issue
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "user_id": 1,
  "course_id": 1
}
```
**Expected Response:** 201 Created with certificate code

**8.2 Verify Certificate**
```
POST http://localhost:3000/api/certificates/verify
Content-Type: application/json

{
  "code": "ABC123DEF4"
}
```
**Expected Response:** 200 OK with certificate details

#### **Phase 9: Performance & Analytics**

**9.1 Get Student Performance**
```
GET http://localhost:3000/api/performance/my
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with performance statistics

**9.2 Get Student Dashboard**
```
GET http://localhost:3000/api/profile/student/dashboard
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with dashboard data

#### **Phase 10: Notifications & Activities**

**10.1 Get My Notifications**
```
GET http://localhost:3000/api/notifications/me
Authorization: Bearer {{student_token}}
```
**Expected Response:** 200 OK with notifications array

**10.2 Log Activity**
```
POST http://localhost:3000/api/activities
Authorization: Bearer {{student_token}}
Content-Type: application/json

{
  "lesson_id": 1,
  "course_id": 1,
  "action": "completed_course"
}
```
**Expected Response:** 201 Created

---

### **Example: Instructor Course Creation Workflow**

#### **Phase 1: Instructor Setup**

**1.1 Instructor Signup**
```
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "first_name": "Dr. Sarah",
  "last_name": "Williams",
  "email": "sarah.instructor@example.com",
  "password": "Instructor456",
  "role": "INSTRUCTOR",
  "phone": "9841234568",
  "bio": "PhD in Computer Science with 10+ years teaching experience",
  "qualifications": "PhD Computer Science",
  "experience_years": 10,
  "expertise_area": "Machine Learning, AI",
  "website": "https://sarahwilliams.edu"
}
```
**Expected Response:** 201 Created with token
**Save token as:** `instructor_token`

#### **Phase 2: Course Creation**

**2.1 Create Advanced Course**
```
POST http://localhost:3000/api/courses
Authorization: Bearer {{instructor_token}}
Content-Type: application/json

{
  "title": "Machine Learning Fundamentals",
  "description": "Comprehensive introduction to machine learning algorithms and applications",
  "category": "Data Science",
  "level": "ADVANCED",
  "price": 25000,
  "thumbnail_url": "https://example.com/ml-thumbnail.jpg",
  "promo_video_url": "https://youtu.be/ml-intro-video",
  "zoom_link": "https://zoom.us/j/987654321",
  "requirements": ["Python programming", "Linear algebra", "Statistics"],
  "learning_outcomes": ["Understand ML algorithms", "Implement models", "Evaluate performance"],
  "duration_weeks": 12,
  "language": "English"
}
```
**Expected Response:** 201 Created
**Save course_id from response**

#### **Phase 3: Content Creation**

**3.1 Create Lesson**
```
POST http://localhost:3000/api/lessons
Authorization: Bearer {{instructor_token}}
Content-Type: application/json

{
  "course_id": {{course_id}},
  "subject_id": 1,
  "title": "Introduction to Supervised Learning",
  "content_type": "VIDEO",
  "content_url": "https://example.com/lesson1.mp4",
  "duration": 45
}
```
**Expected Response:** 201 Created
**Save lesson_id**

**3.2 Add Course Resources**
```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{instructor_token}}
Content-Type: application/json

{
  "course_id": {{course_id}},
  "type": "notes",
  "title": "ML Algorithms Cheat Sheet",
  "content": "Comprehensive reference for machine learning algorithms"
}
```
**Expected Response:** 201 Created

#### **Phase 4: Instructor Analytics**

**4.1 Get My Courses**
```
GET http://localhost:3000/api/courses/instructor/my-courses
Authorization: Bearer {{instructor_token}}
```
**Expected Response:** 200 OK with courses array

**4.2 Get Course Progress Stats**
```
GET http://localhost:3000/api/progress/course/{{course_id}}/stats
Authorization: Bearer {{instructor_token}}
```
**Expected Response:** 200 OK with student progress data

**4.3 Get Instructor Earnings**
```
GET http://localhost:3000/api/instructor-earnings/my-earnings
Authorization: Bearer {{instructor_token}}
```
**Expected Response:** 200 OK with earnings data

---

### **Example: Admin Management Workflow**

#### **Phase 1: Admin Authentication**

**1.1 Admin Login**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@ocms.com",
  "password": "Admin123"
}
```
**Expected Response:** 200 OK with token
**Save token as:** `admin_token`

#### **Phase 2: User Management**

**2.1 Get All Users**
```
GET http://localhost:3000/api/admin/users
Authorization: Bearer {{admin_token}}
```
**Expected Response:** 200 OK with users array

**2.2 Approve Instructor**
```
PUT http://localhost:3000/api/admin/instructors/2/approve
Authorization: Bearer {{admin_token}}
```
**Expected Response:** 200 OK

#### **Phase 3: Course Management**

**3.1 Get All Courses**
```
GET http://localhost:3000/api/admin/courses
Authorization: Bearer {{admin_token}}
```
**Expected Response:** 200 OK with all courses

**3.2 Publish Course**
```
PUT http://localhost:3000/api/courses/1
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "is_published": true
}
```
**Expected Response:** 200 OK

#### **Phase 4: System Analytics**

**4.1 Get Admin Stats**
```
GET http://localhost:3000/api/admin/stats
Authorization: Bearer {{admin_token}}
```
**Expected Response:** 200 OK with system statistics

**4.2 Get All Payments**
```
GET http://localhost:3000/api/admin/payments
Authorization: Bearer {{admin_token}}
```
**Expected Response:** 200 OK with payments data

#### **Phase 5: Content Management**

**5.1 Create Semester Hierarchy**
```
POST http://localhost:3000/api/lesson-resources/semesters
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "Spring 2026",
  "description": "Spring semester 2026"
}
```
**Expected Response:** 201 Created

**5.2 Add Curriculum Resources**
```
POST http://localhost:3000/api/course-resources
Authorization: Bearer {{admin_token}}
Form-Data:
- course_id: 1
- type: notes
- title: Advanced Algorithms Notes
- content: Comprehensive algorithm study materials
- file: [Upload algorithms_notes.pdf]
```
**Expected Response:** 201 Created

---

### **Testing Checklist for Complete Workflow**

#### **Student Journey**
- [ ] Account creation and login
- [ ] Course browsing and enrollment
- [ ] Payment processing for paid courses
- [ ] Lesson access and completion tracking
- [ ] Quiz participation and scoring
- [ ] Resource access (notes, videos, Zoom)
- [ ] Review submission
- [ ] Certificate issuance and verification
- [ ] Performance analytics

#### **Instructor Journey**
- [ ] Account creation with detailed profile
- [ ] Course creation and content management
- [ ] Student progress monitoring
- [ ] Earnings tracking
- [ ] Resource management

#### **Admin Journey**
- [ ] User management and approvals
- [ ] Course publishing workflow
- [ ] System-wide analytics
- [ ] Content hierarchy management
- [ ] Payment oversight

#### **Integration Testing**
- [ ] Cross-role interactions (student-instructor-admin)
- [ ] Payment-enrollment flow
- [ ] Content access controls
- [ ] Notification system
- [ ] Activity logging

---

**🎯 This comprehensive guide covers all OCMS API endpoints with practical examples. Use these workflows to thoroughly test the complete Online Course Management System functionality.**
