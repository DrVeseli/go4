import pb from "./pbInit.js";


document.getElementById("createConversationBtn").addEventListener("click", async () => {
    const usersList = await fetchAllUsers();
    displayUsersForSelection(usersList);
});

const id = pb.authStore.model.id;
const filterQuery = `id != "${id}"`;

async function fetchAllUsers() {
    return await pb.collection('users').getFullList({
        filter: filterQuery,
        sort: '-created',
    });
}

function displayUsersForSelection(users) {
    const conversationsList = document.getElementById("conversationsList");
    
    conversationsList.innerHTML = '';  // Clear the current list

    // Create and append the text input for conversation name

    const nameInput = document.createElement("input");
    nameInput.id = "conversationName";
    nameInput.classList.add("bg-gray-50", "rounded-full", "place-self-center", "w-72", "ml-2", "my-2")
    nameInput.type = "text";
    nameInput.placeholder = "Conversation name...";
    conversationsList.appendChild(nameInput);
    
    const createBtn = document.createElement("button");
    createBtn.textContent = "Create Conversation";
    createBtn.classList.add("bg-gray-50", "rounded-full", "place-self-center", "w-72", "ml-2", "mb-2", "h-8", "bg-blue-500")
    createBtn.addEventListener("click", createConversationFromSelectedUsers);
    conversationsList.appendChild(createBtn);

    users.forEach(user => {
        const li = document.createElement("li");
        li.classList.add("px-1", "py-3");

        li.innerHTML = `
            <label class="text-gray-50 flex justify-between">
            <img src="http://127.0.0.1:8090/api/files/_pb_users_auth_/${user.id}/${user.avatar}" class="h-14 w-14 border border-gray-50 rounded-full">
                <p class="my-auto">${user.username}</p>
                <input type="checkbox" value="${user.id}" class="userCheckbox my-auto border-gray-50 mr-4">
            </label>
        `;
        conversationsList.appendChild(li);
    });

    // Add a button to finalize the creation of the conversation

    document.getElementById("messageInput").focus();

}

async function createConversationFromSelectedUsers() {
    const selectedUsers = [...document.querySelectorAll(".userCheckbox:checked")].map(cb => cb.value);

    if (selectedUsers.length === 0) {
        alert("Please select at least one user.");
        return;
    }

    const conversationName = document.getElementById("conversationName").value || "Default Name";  // Use a default name if none provided

    const data = {
        "name": conversationName,
        "participants": [id, ...selectedUsers]
    };

    const record = await pb.collection('conversations').create(data);
    if (record) {
        window.location.href = "http://127.0.0.1:8090/main.html";
        // Optionally, you can now switch back to displaying the conversation list or do any other post-creation actions.
    } else {
        alert("Failed to create conversation.");
    }
}
