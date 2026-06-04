requireAuth();

let tasks = [];

const taskList = document.getElementById("taskList");
const priorityFilter = document.getElementById("priorityFilter");
const dueDateFilter = document.getElementById("dueDateFilter");

function syncSidebarNav() {
  const rawHash = window.location.hash || "#dashboard";
  const hash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;

  const links = Array.from(document.querySelectorAll(".sidebar nav a"));
  const matching = links.find((a) => a.dataset.nav === hash);
  const activeKey = matching ? hash : "dashboard";

  links.forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === activeKey);
  });

  const statsGrid = document.querySelector(".stats-grid");
  const tasksSection = document.getElementById("tasks");
  const settingsSection = document.getElementById("settings");

  if (statsGrid && tasksSection && settingsSection) {
    if (activeKey === "dashboard") {
      statsGrid.classList.remove("hidden");
      tasksSection.classList.remove("hidden");
      settingsSection.classList.add("hidden");
    } else if (activeKey === "tasks") {
      statsGrid.classList.add("hidden");
      tasksSection.classList.remove("hidden");
      settingsSection.classList.add("hidden");
    } else if (activeKey === "settings") {
      statsGrid.classList.add("hidden");
      tasksSection.classList.add("hidden");
      settingsSection.classList.remove("hidden");
    }
  }

  const target = document.getElementById(activeKey);
  target?.scrollIntoView();
}

window.addEventListener("hashchange", syncSidebarNav);
syncSidebarNav();

function showSpinner() {
  document.getElementById("spinner")?.classList.remove("hidden");
}

function hideSpinner() {
  document.getElementById("spinner")?.classList.add("hidden");
}

function showToast(message) {
  const container = document.getElementById("toast");
  const toast = document.createElement("div");

  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function normalizeTasks(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.tasks)) return data.tasks;
  return [];
}

async function loadTasks() {
  showSpinner();

  try {
    const data = await TaskAPI.getTasks();
    tasks = normalizeTasks(data);
    renderTasks();
    renderStats();
  } catch (err) {
    showToast(err.message);
  } finally {
    hideSpinner();
  }
}

function getFilteredTasks() {
  const priority = priorityFilter.value;
  const dueDate = dueDateFilter.value;

  return tasks.filter((task) => {
    const matchPriority = !priority || task.priority === priority;
    const matchDueDate = !dueDate || task.dueDate === dueDate;

    return matchPriority && matchDueDate;
  });
}

function renderStats() {
  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("pendingTasks").textContent = tasks.filter(
    (t) => t.status === "pending",
  ).length;
  document.getElementById("doneTasks").textContent = tasks.filter(
    (t) => t.status === "done",
  ).length;
}

function renderTasks() {
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    taskList.innerHTML = `<p class="muted">No tasks found.</p>`;
    return;
  }

  taskList.innerHTML = filtered
    .map(
      (task) => `
    <article class="task-card">
      <div class="task-header">
        <div>
          <div class="task-title">${escapeHTML(task.title)}</div>
          <p class="muted">${escapeHTML(task.description || "No description")}</p>
        </div>

        <div class="badges">
          <span class="badge ${task.priority}">${task.priority}</span>
          <span class="badge ${task.status}">${task.status}</span>
        </div>
      </div>

      <p class="muted">Due date: ${task.dueDate || "N/A"}</p>

      <div class="task-actions">
        <button class="btn-outline" onclick="handleEdit('${task.taskId}')">Edit</button>
        <button class="btn-outline" onclick="handleToggleStatus('${task.taskId}')">
          ${task.status === "done" ? "Mark Pending" : "Mark Done"}
        </button>
        <button class="btn-danger" onclick="handleDelete('${task.taskId}')">Delete</button>
      </div>
    </article>
  `,
    )
    .join("");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.getElementById("openCreateModal").addEventListener("click", () => {
  openTaskModal(null, async (payload) => {
    showSpinner();

    try {
      await TaskAPI.createTask(payload);
      showToast("Task created");
      await loadTasks();
    } catch (err) {
      showToast(err.message);
    } finally {
      hideSpinner();
    }
  });
});

async function handleEdit(taskId) {
  const task = tasks.find((t) => t.taskId === taskId);
  if (!task) return;

  openTaskModal(task, async (payload) => {
    showSpinner();

    try {
      await TaskAPI.updateTask(taskId, payload);
      showToast("Task updated");
      await loadTasks();
    } catch (err) {
      showToast(err.message);
    } finally {
      hideSpinner();
    }
  });
}

async function handleToggleStatus(taskId) {
  const task = tasks.find((t) => t.taskId === taskId);
  if (!task) return;

  const updatedTask = {
    ...task,
    status: task.status === "done" ? "pending" : "done",
  };

  showSpinner();

  try {
    await TaskAPI.updateTask(taskId, updatedTask);
    showToast("Task status updated");
    await loadTasks();
  } catch (err) {
    showToast(err.message);
  } finally {
    hideSpinner();
  }
}

async function handleDelete(taskId) {
  if (!confirm("Delete this task?")) return;

  showSpinner();

  try {
    await TaskAPI.deleteTask(taskId);
    showToast("Task deleted");
    await loadTasks();
  } catch (err) {
    showToast(err.message);
  } finally {
    hideSpinner();
  }
}

priorityFilter.addEventListener("change", renderTasks);
dueDateFilter.addEventListener("change", renderTasks);

document.getElementById("clearFilters").addEventListener("click", () => {
  priorityFilter.value = "";
  dueDateFilter.value = "";
  renderTasks();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("idToken");
  localStorage.removeItem("accessToken");
  window.location.href = "./login.html";
});

loadTasks();
