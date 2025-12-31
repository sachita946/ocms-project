
# OCMS - Backend & Frontend API Mapping

## Updated Endpoints Summary

### Auth Endpoints
- `POST /api/auth/signup` - User registration (Student/Instructor)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Course Endpoints
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `GET /api/courses/instructor/my-courses` - Get instructor's courses (AUTH)
- `POST /api/courses` - Create course (INSTRUCTOR/ADMIN)
- `PUT /api/courses/:id` - Update course (INSTRUCTOR/ADMIN)
- `DELETE /api/courses/:id` - Delete course (INSTRUCTOR/ADMIN)

### Lesson Endpoints
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get specific lesson
- `GET /api/lessons/course/:courseId` - Get lessons by course
- `POST /api/lessons` - Create lesson (AUTH)
- `PUT /api/lessons/:id` - Update lesson (AUTH)
- `DELETE /api/lessons/:id` - Delete lesson (AUTH)

### Enrollment Endpoints
- `GET /api/enrollments/me` - Get my enrollments (AUTH)
- `GET /api/enrollments/:id` - Get enrollment details (AUTH)
- `GET /api/enrollments/course/:courseId/students` - Get course students (INSTRUCTOR)
- `GET /api/enrollments/:id/progress-detail` - Get student progress (INSTRUCTOR)
- `POST /api/enrollments` - Enroll in course (AUTH)
- `DELETE /api/enrollments/:id` - Unenroll from course (AUTH)

### Progress Endpoints
- `GET /api/progress/:enrollmentId` - Get enrollment progress (AUTH)
- `GET /api/progress/course/:courseId/stats` - Get course progress stats (INSTRUCTOR)
- `GET /api/progress/all-students` - Get all students progress (ADMIN)
- `POST /api/progress` - Mark lesson complete (AUTH)

### Quiz Endpoints
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get specific quiz
- `GET /api/quizzes/lesson/:lessonId` - Get quiz by lesson
- `POST /api/quizzes` - Create quiz (INSTRUCTOR/ADMIN)
- `POST /api/quizzes/attempt` - Submit quiz attempt (AUTH)
- `PUT /api/quizzes/:id` - Update quiz (INSTRUCTOR/ADMIN)
- `DELETE /api/quizzes/:id` - Delete quiz (INSTRUCTOR/ADMIN)

### Certificate Endpoints
- `GET /api/certificates` - Get my certificates (AUTH)
- `GET /api/certificates/:id` - Get certificate (AUTH)
- `POST /api/certificates` - Issue certificate (AUTH)

### Payment Endpoints
- `GET /api/payments` - Get payments (AUTH)
- `GET /api/payments/:id` - Get payment (AUTH)
- `POST /api/payments` - Create payment (AUTH)
- `PUT /api/payments/:id/status` - Update payment status (AUTH)

### Notification Endpoints
- `GET /api/notifications` - Get notifications (AUTH)
- `POST /api/notifications` - Create notification (AUTH)

### Activity Endpoints
- `GET /api/activities` - Get activities
- `POST /api/activities` - Log activity (AUTH)

### Admin Endpoints (ADMIN ROLE REQUIRED)
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/courses` - Get all courses
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/reviews` - Get all reviews
- `GET /api/admin/notifications` - Get all notifications
- `GET /api/admin/activities` - Get all activities

### Profile Endpoints
- `GET /api/profile/student/me` - Get student profile (AUTH)
- `PUT /api/profile/student/me` - Update student profile (AUTH)
- `GET /api/profile/student/dashboard` - Get student dashboard (AUTH)
- `GET /api/profile/instructor/me` - Get instructor profile (AUTH)
- `PUT /api/profile/instructor/me` - Update instructor profile (AUTH)
- `GET /api/profile/instructor/dashboard` - Get instructor dashboard (AUTH)

### Password Endpoints
- `POST /api/password/forgot` - Request password reset
- `POST /api/password/reset` - Reset password

## Image Assets Location
All images stored in: `/publicc/images/`
- `placeholder-course.svg` - Course thumbnail placeholder
- `default-avatar.svg` - Default user avatar
- `placeholder-certificate.svg` - Certificate template
- `placeholder-lesson.svg` - Lesson placeholder

## Frontend File Locations
- Auth: `/publicc/auth/` (login.html, signup.html, auth.html)
- Student: `/publicc/student/` (student-dashboard.html, courses.html, lessons.html, etc.)
- Instructor: `/publicc/instructor/` (instructor-dashboard.html, create-course.html, student-progress.html, etc.)
- Admin: `/publicc/admin/` (dashboard.html, users.html, courses.html, payment.html, etc.)

## API Client Helper
Use `/publicc/js/api-client.js` for making API calls:
- `apiGet(endpoint)` - GET request
- `apiPost(endpoint, body)` - POST request
- `apiPut(endpoint, body)` - PUT request
- `apiDelete(endpoint)` - DELETE request
- `fetchAPI(endpoint, options)` - Backward compatible fetch

Example usage:
```javascript
// Include in HTML
<script src="/js/api-client.js"></script>

// Use in scripts
const courses = await apiGet('/courses');
const newCourse = await apiPost('/courses', { title: 'Course', price: 99 });
```

## Key Updates Made:
1. Fixed auth endpoints (login, signup)
2. Added instructor courses endpoint
3. Added admin dashboard endpoints
4. Fixed enrollment and progress routes
5. Created placeholder images
6. Added API client helper utility
