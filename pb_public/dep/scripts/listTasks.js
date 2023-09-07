import pb from "./pbInit.js";

async function fetchUserTasks() {
    const userId = pb.authStore.model.id;
  
    // Fetch tasks that are assigned to the user
    const resultList = await pb.collection('tasks').getList(1, 50, {
      filter: `Tasked = "${userId}"`,
      sort: "-DueDate",
    });
  
    return resultList.items;
  }

  function renderTasks(tasks) {
    const tasksListElement = document.getElementById('tasksList');
  
    tasksListElement.innerHTML = ""; // Clear out any old tasks
  
    tasks.forEach(task => {
      const taskElement = document.createElement('li');
      taskElement.innerHTML = `
        <div class="task-item bg-gray-500 p-1 rounded-md h-10 flex justify-between">
          <span class="task-title text-sm font-semibol leading-6 text-gray-50">${task.Title}</span>
        </div>
      `;
  
      tasksListElement.appendChild(taskElement);
    });
  }

  (async function init() {
    // Fetch user's tasks
    const userTasks = await fetchUserTasks();
  
    // Render tasks in the sidebar
    renderTasks(userTasks);
  })();
  