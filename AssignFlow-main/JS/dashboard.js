// dashboard.js - handles the task list page for AssignFlow

// Use case: Session Check
// if nobody is logged in, send them back to the login page
var session =
  localStorage.getItem("assignflow_session") ||
  sessionStorage.getItem("assignflow_session");

if (!session) {
  window.location.href = "auth.html";
}

var currentUser = session ? JSON.parse(session) : null;

if (currentUser) {
  document.getElementById("welcome-message").textContent =
    "Welcome back, " + currentUser.fullname + "!";
}

// Use case: Logout
var logoutLink = document.getElementById("logout-link");
logoutLink.addEventListener("click", function (e) {
  e.preventDefault();
  localStorage.removeItem("assignflow_session");
  sessionStorage.removeItem("assignflow_session");
  window.location.href = "auth.html";
});

// tasks are saved separately for each user email, so two students
// using the same browser don't see each other's tasks
var tasksKey = "assignflow_tasks_" + (currentUser ? currentUser.email : "guest");

function getTasks() {
  var data = localStorage.getItem(tasksKey);
  if (data) {
    return JSON.parse(data);
  }
  return [];
}

function saveTasks(tasks) {
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
}

var taskListEl = document.getElementById("task-list");
var emptyMessageEl = document.getElementById("empty-message");
var filterSelect = document.getElementById("filter-select");

// Use case: View / Filter Tasks
function renderTasks() {
  var tasks = getTasks();
  var filter = filterSelect.value;

  taskListEl.innerHTML = "";

  var visibleTasks = tasks.filter(function (task) {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    emptyMessageEl.style.display = "block";
  } else {
    emptyMessageEl.style.display = "none";
  }

  visibleTasks.forEach(function (task) {
    var li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");

    var dueText = task.due ? "Due: " + task.due : "No due date";

    li.innerHTML =
      '<div class="task-info">' +
      '<p class="task-title">' +
      task.title +
      "</p>" +
      '<span class="task-meta">' +
      dueText +
      '<span class="priority-badge priority-' +
      task.priority +
      '">' +
      task.priority +
      "</span>" +
      "</span>" +
      "</div>" +
      '<div class="task-actions">' +
      '<button class="complete-btn" data-id="' +
      task.id +
      '">' +
      (task.completed ? "Undo" : "Complete") +
      "</button>" +
      '<button class="delete-btn" data-id="' +
      task.id +
      '">Delete</button>' +
      "</div>";

    taskListEl.appendChild(li);
  });
}

// Use case: Add Task
var addTaskForm = document.getElementById("add-task-form");
addTaskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  var title = document.getElementById("task-title").value.trim();
  var due = document.getElementById("task-due").value;
  var priority = document.getElementById("task-priority").value;

  if (title === "") {
    return;
  }

  var tasks = getTasks();

  tasks.push({
    id: Date.now(), // good enough way to get a unique id for a student project
    title: title,
    due: due,
    priority: priority,
    completed: false,
  });

  saveTasks(tasks);
  addTaskForm.reset();
  document.getElementById("task-priority").value = "medium";
  renderTasks();
});

// Use case: Complete / Delete Task
// using one listener on the list instead of one per button
taskListEl.addEventListener("click", function (e) {
  var target = e.target;
  var id = Number(target.getAttribute("data-id"));

  if (!id) {
    return;
  }

  var tasks = getTasks();

  if (target.classList.contains("complete-btn")) {
    tasks = tasks.map(function (task) {
      if (task.id === id) {
        task.completed = !task.completed;
      }
      return task;
    });
    saveTasks(tasks);
    renderTasks();
  }

  if (target.classList.contains("delete-btn")) {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });
    saveTasks(tasks);
    renderTasks();
  }
});

filterSelect.addEventListener("change", renderTasks);

renderTasks();
