function getToken() {
  return localStorage.getItem("idToken");
}

function isMockEnabled() {
  return Boolean(CONFIG?.USE_MOCK);
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "./login.html";
  }
}

async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}

const TaskAPI = {
  getTasks() {
    return apiFetch("/tasks");
  },

  createTask(task) {
    return apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  updateTask(id, task) {
    return apiFetch(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    });
  },

  deleteTask(id) {
    return apiFetch(`/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
