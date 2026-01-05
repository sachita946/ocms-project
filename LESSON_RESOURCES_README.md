# 📚 Lesson Resources Management System

## Quick Start Guide

### What's New?
Admin can now manage **Notes, Board Questions, and Pre-board Questions** for each lesson organized in a **hierarchical structure**:

```
8 Semesters
  ├── 5 Subjects per Semester
  │   └── 5 Lessons per Subject
  │       ├── 📝 Notes
  │       ├── ❓ Questions
  │       └── 🎯 Preboard Questions
```

**Total: 200 lessons (8 × 5 × 5)**

---

## Accessing the Feature

### For Admins:

1. **Login to Admin Dashboard**
2. **Navigate to → Lesson Resources** (📖 button in sidebar)
3. Or go directly to: `/admin/lesson-resources.html`

---

## How to Use

### Step 1: Select a Semester
- Click on any **Semester** (1-8) to expand it
- You'll see all 5 subjects for that semester

### Step 2: Select a Subject
- Click on a **Subject** within the semester
- You'll see all 5 lessons for that subject

### Step 3: Select a Lesson
- Click on a **Lesson** to select it
- The right panel will show the resource management form

### Step 4: Add a Resource
1. Select **Resource Type** (Notes / Questions / Preboard)
2. Enter a **Title**
3. Write the **Content**
4. Click **✨ Add Resource**

### Step 5: Manage Resources
- View all resources below the form
- Click **👁 View** to see full content
- Click **🗑 Delete** to remove a resource

---

## Resource Types Explained

| Type | Icon | Purpose | Example |
|------|------|---------|---------|
| **Notes** | 📝 | Study materials, summaries, key concepts | Class notes, lecture highlights |
| **Questions** | ❓ | Practice questions for learning | MCQs, short answers, discussion questions |
| **Preboard** | 🎯 | Pre-exam/board questions | Mock exam questions, board-style questions |

---

## Database Structure

### Hierarchy:
```sql
Semester (8)
  ├─ Subject (5 per semester)
  │   └─ Lesson (5 per subject)
  │       └─ LessonResource (notes/questions/preboard)
```

### Key Fields:
- **Semester**: ID, number (1-8), name, description
- **Subject**: ID, semester_id, title, description
- **Lesson**: ID, subject_id, course_id, title, content_type, duration
- **LessonResource**: ID, lesson_id, type, title, content, user_id

---

## API Endpoints

### Base URL: `http://localhost:5000/api/admin`

#### Lesson Resources:
```
GET    /lesson-resources              Get all resources (with filters)
GET    /lesson-resources/:id          Get single resource
POST   /lesson-resources              Create new resource
PUT    /lesson-resources/:id          Update resource
DELETE /lesson-resources/:id          Delete resource
```

#### Hierarchy (Admin only):
```
GET    /semesters                     Get all semesters
GET    /subjects?semester_id=X        Get subjects by semester
GET    /lessons?subject_id=X          Get lessons by subject
POST   /semesters                     Create semester
POST   /subjects                      Create subject
POST   /lessons                       Create lesson
```

---

## Features

✅ **Hierarchical Navigation**
- Expandable tree view for semesters, subjects, and lessons
- Clean, organized interface

✅ **Resource Management**
- Add, view, and delete resources
- Three resource types supported
- Rich text content support

✅ **Admin-Only Access**
- Role-based access control
- Only admins can modify resources
- JWT token authentication

✅ **Full CRUD Operations**
- Create new resources
- Read/view resources
- Update resources
- Delete resources

✅ **Automatic Cascading**
- Delete semester → all subjects/lessons/resources deleted
- Maintains data integrity

---

## Files Modified/Created

### New Files:
- `publicc/admin/lesson-resources.html` - Admin interface
- `publicc/admin/js/lesson-resources.js` - Frontend logic
- `src/controllers/lessonResources.controller.js` - API controller
- `src/controllers/adminHierarchy.controller.js` - Hierarchy controller
- `src/routes/lessonResources.routes.js` - API routes
- `src/scripts/seed-hierarchy.js` - Database seeding

### Modified Files:
- `prisma/schema.prisma` - Added Semester, Subject, LessonResource models
- `publicc/admin/dashboard.html` - Added navigation link
- `src/routes/index.routes.js` - Registered new routes

---

## Database Seeding

The system comes with pre-populated data:

**Automatically Created:**
- ✅ 8 Semesters
- ✅ 40 Subjects (5 per semester)
- ✅ 200 Lessons (5 per subject)
- ✅ 1 Default Instructor
- ✅ 1 Default Course

### Seed Manually:
```bash
node src/scripts/seed-hierarchy.js
```

---

## Testing Checklist

- [ ] Login as admin
- [ ] Navigate to Lesson Resources
- [ ] Expand Semester 1
- [ ] Expand Subject 1
- [ ] Click Lesson 1
- [ ] Add a Note
- [ ] Add a Question
- [ ] Add a Preboard Question
- [ ] View each resource
- [ ] Delete a resource
- [ ] Verify resource appears in database

---

## Data Example

```javascript
// Resource Object
{
  id: 1,
  lesson_id: 5,
  type: "notes",
  title: "Introduction to Algebra",
  content: "Algebra is a branch of mathematics...",
  user_id: "admin-user-id",
  created_at: "2025-01-03T02:40:22.000Z",
  updated_at: "2025-01-03T02:40:22.000Z"
}
```

---

## Troubleshooting

### Issue: "Select a lesson first"
- **Solution**: Click on a lesson in the hierarchy tree

### Issue: Resources not loading
- **Solution**: Check browser console for errors, verify API is running

### Issue: Cannot add resource
- **Solution**: Ensure you're logged in as admin with valid token

### Issue: Semesters not showing
- **Solution**: Run seed script: `node src/scripts/seed-hierarchy.js`

---

## Technical Details

### Authentication:
- JWT token required (stored in `ocms_token`)
- Admin role required for modifications

### Validation:
- All inputs validated on backend
- Resource type must be: notes, questions, or preboard
- Title and content required

### Error Handling:
- User-friendly error messages
- Proper HTTP status codes
- Console logging for debugging

---

## Future Enhancements

- [ ] Student read-only view for resources
- [ ] Search and filter resources
- [ ] Bulk upload resources
- [ ] Resource versioning/history
- [ ] Comments on resources
- [ ] Resource sharing between semesters
- [ ] Export resources to PDF
- [ ] Resource attachments (files, images)

---

## Support

For issues or questions:
1. Check the console (F12) for error messages
2. Verify all API endpoints are running
3. Check database connection
4. Ensure proper authentication token

---

**Version:** 1.0  
**Last Updated:** January 3, 2025  
**Status:** ✅ Production Ready
