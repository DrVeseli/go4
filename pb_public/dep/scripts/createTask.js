import pb from "./pbInit.js";

const id = pb.authStore.model.id;
const filterQuery = `id != "${id}"`;

async function fetchAllUsers() {
    return await pb.collection('users').getFullList({
        filter: filterQuery,
        sort: '-created',
    });
}

document.getElementById("createTaskBtn").addEventListener("click", async () => {
    const usersList = await fetchAllUsers();
    displayNewTaskForm(usersList);
});

function displayNewTaskForm(users) {
    const taskList = document.getElementById("tasksList");
    
    taskList.innerHTML = '';  // Clear the current list

     



    const nameInput = document.createElement("input");
    nameInput.id = "taskTitle";
    nameInput.classList.add("bg-gray-50", "rounded-full", "place-self-center", "w-72", "ml-2", "my-2")
    nameInput.type = "text";
    nameInput.placeholder = "name...";
    taskList.appendChild(nameInput);

    const descInput = document.createElement("input");
    descInput.id = "taskDesc";
    descInput.classList.add("bg-gray-50", "rounded-full", "place-self-center", "h-80", "w-72", "ml-2", "my-2")
    descInput.type = "text";
    descInput.placeholder = "description...";
    taskList.appendChild(descInput);

    // Create and append the input for date selection
    const dateInput = document.createElement("input");
    dateInput.classList.add("bg-gray-50", "rounded-full", "my-2", "ml-2")
    dateInput.id = "dueDate";
    dateInput.type = "date";
    taskList.appendChild(dateInput);

    const userDropdown = document.createElement("select");
     userDropdown.id = "userSelection";
     userDropdown.classList.add("bg-gray-50", "rounded-full", "my-2", "ml-2")
     users.forEach(user => {
         const option = document.createElement("option");
         option.value = user.id;
         option.textContent = user.username;
         userDropdown.appendChild(option);
     });
     taskList.appendChild(userDropdown);
    
    const createBtn = document.createElement("button");
    createBtn.textContent = "Create a Task";
    createBtn.classList.add("bg-gray-50", "rounded-full", "place-self-center", "w-72", "ml-2", "mb-2", "h-8", "bg-blue-500")
    createBtn.addEventListener("click", createConversationFromSelectedUsers);
    taskList.appendChild(createBtn);
}


async function createConversationFromSelectedUsers() {
    const taskName = document.getElementById("taskTitle").value || "Default Name";
    const taskDesc = document.getElementById("taskDesc").value || "None";
    const dueDate = document.getElementById("dueDate").value;
    const taskRec = document.getElementById("userSelection").value;


    const tasker = pb.authStore.model.id
    const data = {
        "Title": taskName,
        "Description": taskDesc,
        "Tasker": tasker,
        "Tasked": taskRec,
        "DueDate": dueDate || "2020-09-22 12:00:00.000Z",
    };
    const record = await pb.collection('tasks').create(data);
}