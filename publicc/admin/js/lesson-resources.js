// ============================================
// LESSON RESOURCES MANAGEMENT
// ============================================

initAdminPage();

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('ocms_token');

let semesters = [];
let subjects = [];
let lessons = [];
let selectedLesson = null;
let lessonResources = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSemesters();
  setupFormHandlers();
});

// ============================================
// LOAD HIERARCHY
// ============================================

async function loadSemesters() {
  try {
    const response = await fetch(`${API_URL}/admin/semesters`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load semesters');
    
    const data = await response.json();
    semesters = data.semesters || [];
    renderHierarchy();
  } catch (error) {
    console.error('Error loading semesters:', error);
    showMessage('Error loading semesters', 'error');
  }
}

function renderHierarchy() {
  const tree = document.getElementById('hierarchyTree');
  
  if (!semesters.length) {
    tree.innerHTML = '<div style="text-align: center; color: #a0a0a0; padding: 20px;">No semesters found</div>';
    return;
  }
  
  tree.innerHTML = '';
  
  semesters.forEach(semester => {
    const semesterDiv = document.createElement('div');
    semesterDiv.className = 'semester-item';
    semesterDiv.innerHTML = `
      <div class="semester-title">
        🎓 ${semester.name}
        <span class="semester-toggle">▼</span>
      </div>
      <div class="subjects-list" style="display: none;" data-semester-id="${semester.id}"></div>
    `;
    
    semesterDiv.addEventListener('click', (e) => {
      if (e.target.closest('.semester-toggle') || e.currentTarget === e.target) {
        const subjectsList = semesterDiv.querySelector('.subjects-list');
        const isHidden = subjectsList.style.display === 'none';
        subjectsList.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden && !subjectsList.children.length) {
          loadSubjects(semester.id, subjectsList);
        }
      }
    });
    
    tree.appendChild(semesterDiv);
  });
}

async function loadSubjects(semesterId, parentElement) {
  try {
    const response = await fetch(`${API_URL}/admin/subjects?semester_id=${semesterId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load subjects');
    
    const data = await response.json();
    const semesterSubjects = data.subjects || [];
    
    parentElement.innerHTML = '';
    
    if (!semesterSubjects.length) {
      parentElement.innerHTML = '<div style="padding: 12px; color: #a0a0a0; font-size: 13px;">No subjects found</div>';
      return;
    }
    
    semesterSubjects.forEach(subject => {
      const subjectDiv = document.createElement('div');
      subjectDiv.className = 'subject-item';
      subjectDiv.innerHTML = `
        <span>📘 ${subject.title}</span>
        <div class="lessons-list" style="display: none;" data-subject-id="${subject.id}"></div>
      `;
      
      subjectDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        const lessonsList = subjectDiv.querySelector('.lessons-list');
        const isHidden = lessonsList.style.display === 'none';
        lessonsList.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden && !lessonsList.children.length) {
          loadLessons(subject.id, lessonsList);
        }
      });
      
      parentElement.appendChild(subjectDiv);
    });
  } catch (error) {
    console.error('Error loading subjects:', error);
  }
}

async function loadLessons(subjectId, parentElement) {
  try {
    const response = await fetch(`${API_URL}/admin/lessons?subject_id=${subjectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load lessons');
    
    const data = await response.json();
    const subjectLessons = data.lessons || [];
    
    parentElement.innerHTML = '';
    
    if (!subjectLessons.length) {
      parentElement.innerHTML = '<div style="padding: 10px; color: #a0a0a0; font-size: 12px;">No lessons</div>';
      return;
    }
    
    subjectLessons.forEach(lesson => {
      const lessonDiv = document.createElement('div');
      lessonDiv.className = 'lesson-item';
      lessonDiv.textContent = `📌 ${lesson.title}`;
      
      lessonDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        selectLesson(lesson.id, lesson.title);
        document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
        lessonDiv.classList.add('active');
      });
      
      parentElement.appendChild(lessonDiv);
    });
  } catch (error) {
    console.error('Error loading lessons:', error);
  }
}

// ============================================
// SELECT & DISPLAY LESSON
// ============================================

function selectLesson(lessonId, lessonTitle) {
  selectedLesson = { id: lessonId, title: lessonTitle };
  
  document.getElementById('selectPrompt').style.display = 'none';
  document.getElementById('resourceForm').style.display = 'flex';
  document.getElementById('resourcesList').style.display = 'block';
  
  loadLessonResources(lessonId);
}

async function loadLessonResources(lessonId) {
  try {
    const response = await fetch(`${API_URL}/admin/lesson-resources?lesson_id=${lessonId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to load resources');
    
    const data = await response.json();
    lessonResources = data.resources || [];
    displayLessonResources();
  } catch (error) {
    console.error('Error loading lesson resources:', error);
  }
}

function displayLessonResources() {
  const list = document.getElementById('resourcesList');
  
  if (!lessonResources.length) {
    list.innerHTML = '<p style="color: #a0a0a0; text-align: center; font-size: 13px; padding: 20px;">No resources yet</p>';
    return;
  }
  
  list.innerHTML = '<h4 style="color: #ffffff; margin-bottom: 12px; font-size: 13px;">📦 Resources</h4>';
  
  lessonResources.forEach(resource => {
    const resourceDiv = document.createElement('div');
    resourceDiv.className = 'resource-item';
    
    const typeEmoji = {
      'notes': '📝',
      'questions': '❓',
      'preboard': '🎯'
    }[resource.type] || '📄';
    
    resourceDiv.innerHTML = `
      <span class="resource-type">${typeEmoji} ${resource.type.toUpperCase()}</span>
      <div class="resource-title">${resource.title}</div>
      <div class="resource-preview">${resource.content.substring(0, 100)}...</div>
      <div class="resource-actions">
        <button onclick="viewResource(${resource.id})">👁 View</button>
        <button onclick="deleteResource(${resource.id})" style="background: rgba(255,107,107,0.3); color: #ff8787;">🗑 Delete</button>
      </div>
    `;
    
    list.appendChild(resourceDiv);
  });
}

// ============================================
// FORM HANDLERS
// ============================================

function setupFormHandlers() {
  const form = document.getElementById('resourceForm');
  form.addEventListener('submit', handleAddResource);
}

async function handleAddResource(e) {
  e.preventDefault();
  
  if (!selectedLesson) {
    showMessage('Please select a lesson first', 'error');
    return;
  }
  
  const type = document.getElementById('resourceType').value;
  const title = document.getElementById('resourceTitle').value.trim();
  const content = document.getElementById('resourceContent').value.trim();
  
  if (!type || !title || !content) {
    showMessage('Please fill in all fields', 'error');
    return;
  }
  
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Adding...';
  
  try {
    const response = await fetch(`${API_URL}/admin/lesson-resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        lesson_id: selectedLesson.id,
        type,
        title,
        content
      })
    });
    
    if (response.ok) {
      showMessage('✅ Resource added successfully!', 'success');
      document.getElementById('resourceForm').reset();
      await loadLessonResources(selectedLesson.id);
    } else {
      const error = await response.json();
      showMessage('Error: ' + (error.message || 'Failed to add resource'), 'error');
    }
  } catch (error) {
    console.error('Error adding resource:', error);
    showMessage('Failed to add resource', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

async function deleteResource(resourceId) {
  if (!confirm('Are you sure you want to delete this resource?')) return;
  
  try {
    const response = await fetch(`${API_URL}/admin/lesson-resources/${resourceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      showMessage('✅ Resource deleted!', 'success');
      await loadLessonResources(selectedLesson.id);
    } else {
      showMessage('Failed to delete resource', 'error');
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    showMessage('Failed to delete resource', 'error');
  }
}

function viewResource(resourceId) {
  const resource = lessonResources.find(r => r.id === resourceId);
  if (resource) {
    alert(`📋 ${resource.title}\n\n${resource.content}`);
  }
}

// ============================================
// UTILITIES
// ============================================

function showMessage(message, type = 'info') {
  const msgDiv = document.getElementById('resourceMessage');
  msgDiv.className = `message ${type}`;
  msgDiv.textContent = message;
  msgDiv.style.display = 'block';
  
  setTimeout(() => {
    msgDiv.style.display = 'none';
  }, 4000);
}
