function openTaskModal(task = null, onSubmit) {
  const modal = document.getElementById("taskModal");

  modal.innerHTML = `
    <div class="modal-card">
      <h2>${task ? "Edit Task" : "Create Task"}</h2>

      <form id="taskForm">
        <input 
          id="taskTitle" 
          placeholder="Task title" 
          value="${task?.title || ""}" 
          required 
        />

        <textarea 
          id="taskDescription" 
          placeholder="Description" 
          rows="4"
        >${task?.description || ""}</textarea>

        <select id="taskPriority" required>
          <option value="low" ${task?.priority === "low" ? "selected" : ""}>Low</option>
          <option value="medium" ${task?.priority === "medium" ? "selected" : ""}>Medium</option>
          <option value="high" ${task?.priority === "high" ? "selected" : ""}>High</option>
        </select>

        <input 
          id="taskDueDate" 
          type="date" 
          value="${task?.dueDate || ""}" 
          required 
        />

        <select id="taskStatus" required>
          <option value="pending" ${task?.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="done" ${task?.status === "done" ? "selected" : ""}>Done</option>
        </select>

        <div class="modal-actions">
          <button type="button" id="closeModal" class="btn-outline">Cancel</button>
          <button type="submit" class="btn-primary">${task ? "Save" : "Create"}</button>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove("hidden");

  document.getElementById("closeModal").onclick = closeTaskModal;

  document.getElementById("taskForm").onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: document.getElementById("taskTitle").value.trim(),
      description: document.getElementById("taskDescription").value.trim(),
      priority: document.getElementById("taskPriority").value,
      dueDate: document.getElementById("taskDueDate").value,
      status: document.getElementById("taskStatus").value,
    };

    await onSubmit(payload);
    closeTaskModal();
  };
}

function closeTaskModal() {
  document.getElementById("taskModal").classList.add("hidden");
}
