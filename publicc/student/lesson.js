const lessonsContainer = document.querySelector("#lessons-container");
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("course");

async function fetchLessons() {
  try {
    const res = await fetch(`/api/lessons?course=${courseId}`);
    const lessons = await res.json();
    displayLessons(lessons);
  } catch (err) {
    console.error(err);
  }
}

function displayLessons(lessons) {
  lessonsContainer.innerHTML = "";
  lessons.forEach(lesson => {
    const div = document.createElement("div");
    div.classList.add("lesson-card");
    div.innerHTML = `
      <h4>${lesson.title}</h4>
      <p>Type: ${lesson.content_type}</p>
      <button onclick="addVideoNote(${lesson.id})">Add Note</button>
      <button onclick="showActivities(${lesson.id})">Activities</button>
    `;
    lessonsContainer.appendChild(div);
  });
}

async function addVideoNote(lessonId) {
  const text = prompt("Enter your note:");
  if (!text) return;
  try {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lesson_id: lessonId,
        user_id: "replace-with-user-id",
        text,
        timestamp_seconds: 0,
      }),
    });
    const data = await res.json();
    alert("Note added!");
  } catch (err) {
    console.error(err);
  }
}

async function showActivities(lessonId) {
  const res = await fetch(`/api/activities?lesson_id=${lessonId}`);
  const activities = await res.json();
  let msg = "Activities:\n";
  activities.forEach(a => {
    msg += `${a.activity_type} - ${a.description}\n`;
  });
  alert(msg);
}

fetchLessons();
