# Instructor Dashboard - Quick Reference Guide

## Overview
The enhanced instructor dashboard provides a complete platform for managing courses, tracking earnings, and monitoring student engagement.

## Navigation Menu
```
📊 Overview      - Quick statistics and key metrics
📚 Courses       - View and manage all courses
💰 Earnings      - Revenue visualization and breakdown
📖 Lessons       - All lessons across courses
👥 Students      - Enrolled students list
📝 Quizzes       - Quizzes and assessments
👤 Profile       - Profile information and settings
🔔 Notifications - Notifications and activity log
```

## Features

### Overview Section
- **Display:** 4 key statistics (Courses, Published, Students, Revenue)
- **Action:** "Create New Course" button
- Shows high-level teaching metrics

### Courses Section
- **Display:** 
  - Course title
  - Number of lessons and reviews
  - Student enrollment count
  - Published/Draft status badge
  - Revenue earned
- **Action:** "New Course" button to add courses
- **Color Coding:**
  - 🟢 Published courses (green)
  - 🟠 Draft courses (orange)

### Earnings Section
- **Display:**
  - Interactive bar chart (Revenue vs Enrollments per course)
  - Per-course revenue breakdown
  - Per-student average revenue
- **Chart Features:**
  - Responsive design
  - Color-coded bars (cyan/blue)
  - Hover tooltips
  - Grid background

### Lessons Section
- **Display:**
  - Lesson name
  - Associated course
  - Lesson type (Video/Document/Content)
- **Usage:** View all content created across courses

### Students Section
- **Display:**
  - Student name
  - Email address
  - Number of courses enrolled in
  - Active status badge
- **Limit:** Shows first 50 students
- **Color Coding:** 🟢 Active status (green)

### Quizzes Section
- **Display:**
  - Quiz/Assessment name
  - Associated course
  - Number of questions
  - Passing score percentage
- **Usage:** Manage all assessments and quizzes

### Profile Section
- **Display:**
  - Full name
  - Email address
  - Member since date
  - Expertise area
  - Website
  - Verification status
- **Actions:**
  - Edit Profile button (coming soon)
  - Change Password button (coming soon)

### Notifications Section
- **Display:**
  - Recent notifications
  - Recent activity logs
  - Timestamps for each item
- **Sections:**
  - Notifications (messages and alerts)
  - Activity (course/lesson events)

## API Integration

### Endpoint
```
GET /api/profile/me
Headers: { Authorization: 'Bearer <token>' }
```

### Expected Response Structure
```javascript
{
  dashboard: {
    role: 'INSTRUCTOR',
    stats: {
      courses: number,
      published: number,
      drafts: number,
      students: number,
      revenue: number,
      reviews: number
    },
    lists: {
      courses: [{
        title: string,
        lessons: number,
        enrollments: number,
        reviews: number,
        revenue: number,
        published: boolean,
        quizzes: [],
        lessons: []
      }],
      notifications: [{
        message: string,
        created_at: date
      }],
      activities: [{
        action: string,
        course: { title: string },
        lesson: { title: string },
        created_at: date
      }]
    }
  },
  user: {
    first_name: string,
    last_name: string,
    email: string,
    created_at: date,
    instructorProfile: {
      expertise_area: string,
      website: string,
      is_verified: boolean
    }
  }
}
```

## Color Scheme

### Primary Colors
- **Cyan:** #06b6d4 (main accent)
- **Light Blue:** #38bdf8 (secondary)
- **Dark Blue:** #0b1226 (background)

### Status Colors
- **Published:** #22c55e (green)
- **Draft:** #f97316 (orange)
- **Active:** #22c55e (green)
- **Verified:** #22c55e (green)

### Text Colors
- **Primary:** #e9f2ff (light blue)
- **Muted:** #9bb0c9 (gray blue)
- **Dark Background:** #0b1226 - #0d5b7c

## Key Functions

### Navigation
```javascript
switchSection(section)  // Switch between dashboard sections
```

### Formatting
```javascript
fmtCurrency(number)     // Format as USD ($)
fmtDate(dateString)     // Format date as locale string
```

### Data Rendering
```javascript
renderOverview(dashboard)      // Show statistics
renderCourses(courses)         // Display courses
renderEarnings(dashboard)      // Show earnings chart
renderLessons(courses)         // List lessons
renderStudents(courses)        // Show students
renderQuizzes(courses)         // Display quizzes
renderProfile(user)            // Show profile
renderNotifications(items)     // Display notifications
```

### Utilities
```javascript
bootstrap()            // Initialize dashboard
setStats(stats)        // Update stat cards
renderHeader(user)     // Display user info
```

## Responsive Design

### Desktop (> 980px)
- 2-column layout (sidebar + content)
- Full-width panels
- Side-by-side hero section

### Tablet (981px - 768px)
- Stack layout elements
- Full-width content
- Mobile-friendly navigation

### Mobile (< 768px)
- Single column layout
- Sidebar below header
- Touch-friendly buttons
- Stacked sections

## Security Features

✅ Token-based authentication
✅ Role validation (INSTRUCTOR only)
✅ Automatic logout on invalid token
✅ Session management
✅ Secure API calls with Bearer token

## Performance Optimizations

- Chart.js for efficient visualizations
- Lazy loading of sections
- Optimized DOM manipulation
- Event delegation for navigation
- Responsive animations (0.3s)

## Known Limitations

⏳ Edit Profile - Feature coming soon
⏳ Change Password - Feature coming soon
⏳ Course Creation - Links to `/instructor/create-course.html`
⏳ Lesson Management - View-only in current version

## Troubleshooting

### Dashboard Not Loading
1. Check if token is valid: `localStorage.getItem('ocms_token')`
2. Verify user is INSTRUCTOR role
3. Check network tab for API errors
4. Clear localStorage and re-login

### Charts Not Displaying
1. Verify Chart.js CDN is loaded
2. Check if courses have revenue data
3. Ensure canvas element exists (id="earningsChart")

### Data Not Showing
1. Verify API endpoint is correct
2. Check if response matches expected structure
3. Check browser console for errors
4. Verify Bearer token is included in request

## Development Notes

### To Add New Section
1. Add button to navigation with `data-section="name"`
2. Create `<section id="section-name" class="panel">`
3. Add render function `render[Name](data)`
4. Call render function in `bootstrap()`

### To Modify Styling
1. Update CSS in `<style>` tag
2. Keep color scheme consistent
3. Maintain responsive design
4. Test on mobile devices

### To Change API Endpoint
1. Modify endpoint in `bootstrap()` function
2. Update response structure parsing
3. Adjust render functions if data structure changes

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Chrome/Safari (latest)

---

Last Updated: December 26, 2025
Version: 2.0 (Enhanced)
