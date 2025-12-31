const API_URL = "http://localhost:5000/api/notes"; 
const token = localStorage.getItem("token"); // JWT after login

// Load notes when lesson ID is entered
document.getElementById("lessonId").addEventListener("input", loadNotes);

async function addNote() {
  const lesson_id = document.getElementById("lessonId").value;
  const timestamp_seconds = document.getElementById("timestamp").value;
  const text = document.getElementById("noteText").value;

  if (!lesson_id || !text) {
    alert("Lesson ID and note text required!");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ lesson_id, timestamp_seconds, text })
  });

  if (res.ok) {
    document.getElementById("noteText").value = "";
    loadNotes();
  }
}

async function loadNotes() {
  const lesson_id = document.getElementById("lessonId").value;

  if (!lesson_id) return;

  const res = await fetch(`${API_URL}?lesson_id=${lesson_id}`, {
    headers: { "Authorization": "Bearer " + token }
  });

  const notes = await res.json();
  displayNotes(notes);
}

function displayNotes(notes) {
  const list = document.getElementById("notesList");
  list.innerHTML = "";

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "note-card";

    div.innerHTML = `
      <p><strong>⏱ ${note.timestamp_seconds}s</strong></p>
      <p>${note.text}</p>

      <div class="note-actions">
        <button class="action-btn" onclick="editNote('${note.id}', '${note.text}')">Edit</button>
        <button class="action-btn" onclick="deleteNote('${note.id}')">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

async function editNote(id, oldText) {
  const newText = prompt("Edit your note:", oldText);
  if (!newText) return;

  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ text: newText })
  });

  loadNotes();
}

async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  loadNotes();
}
