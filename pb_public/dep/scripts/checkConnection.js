import { setCurrentConversation } from "./realTime.js";
import pb from "./pbInit.js";


// Redirect if not authenticated
if (!pb.authStore.isValid) {
    window.location.href = "/";
}

let activeConversationId = localStorage.getItem('activeConversationId') || null;
const userId = pb.authStore.model.id;
let userMap = {};  // This will store the mapping of userID -> username

// Utility functions
async function fetchCollectionItems(collectionName, params = {}) {
    return await pb.collection(collectionName).getList(1, 30, params);  // Default values adjusted
}

function createElementWithAttributes(tag, attributes) {
    const element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

// User functions
async function fetchAndDisplayUser() {
    const record = await fetchCollectionItems("users", { id: userId });
    if (record && record.avatar) {
        document.querySelector("#personalInfo img").src = `api/files/_pb_users_auth_/${userId}/${record.avatar}`;
    }
}

async function fetchUsers() {
    const users = await fetchCollectionItems("users");
    users.items.forEach(user => userMap[user.id] = user.username);
}

// Message functions
async function displayMessagesForConversation(conversationId) {
    const messages = await fetchCollectionItems("messages", {
        filter: `conversation="${conversationId}"`,
        sort: "-created",
        expand: 'sender'
    });

    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = ''; // Clear previous messages

    messages.items.reverse().forEach(message => {
        const messageElement = createMessageElement(message);
        messagesList.appendChild(messageElement);
    });

    document.getElementById("chatArea").scrollTop = chatArea.scrollHeight + 100;
}

function createMessageElement(message) {
    const li = createElementWithAttributes("li", { class: "p-2 my-1 rounded-lg bg-white" });
    li.innerHTML = `
        <div class="flex">
            <img class="h-8 ml-2 w-8 border border-gray-900 relative right-2 flex-none rounded-full" src="api/files/_pb_users_auth_/${message.sender}/${message.expand.sender.avatar}" alt="">
            <p class="mr-1 font-semibold">${userMap[message.sender]}</p>
            <p>${message.message}</p>
        </div>
        <div>
            <small class="text-gray-500">${new Date(message.created).toLocaleTimeString()}</small>
        </div>
    `;
    return li;
}

// Conversation functions
async function fetchAndDisplayConversations() {
    const conversations = await fetchCollectionItems("conversations", { filter: `participants ~ "${userId}"` });

    conversations.items.forEach(conversation => {
        const conversationElement = createConversationElement(conversation);
        document.getElementById("conversationsList").appendChild(conversationElement);
    });
}

function createConversationElement(conversation) {
    const li = createElementWithAttributes("li", {
        class: "flex justify-between px-1 py-3",
        'data-conversation-id': conversation.id
    });

    li.innerHTML = `
        <div class="flex min-w-0 gap-x-4">
            <img class="h-14 w-14 flex-none border border-gray-50 rounded-full" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
            <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibol leading-6 text-gray-50">${conversation.name}</p>
            </div>
        </div>
        <div class="shrink-0 sm:flex sm:flex-col sm:items-end">
            <p id="notif" class="text-sm leading-6 text-gray-50"></p>
        </div>
    `;

    li.addEventListener("click", () => handleConversationClick(conversation));

    return li;
}
let clickHandler; // Move these declarations to the top-level scope
let keydownHandler;

// Bind events to send messages
function bindMessageSendEvent(conversationId, userId) {
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const messageInput = document.getElementById("messageInput");


    // Clear previous event listeners
    if (clickHandler) {
        sendMessageBtn.removeEventListener("click", clickHandler);
        messageInput.removeEventListener("keydown", keydownHandler);
    }

    clickHandler = async () => {
        const messageText = messageInput.value;
        if (!messageText.trim()) {
            alert("Message cannot be empty!");
            return;
        }

        const newMessage = {
            message: messageText,
            conversation: conversationId,
            sender: userId,
        };

        const response = await pb.collection("messages").create(newMessage);
        if (response) {
            messageInput.value = '';
        } else {
            alert("Failed to send message.");
        }
    };

    keydownHandler = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            clickHandler();
        }
    };

    // Bind the event listeners
    sendMessageBtn.addEventListener("click", clickHandler);
    messageInput.addEventListener("keydown", keydownHandler);
}

function handleConversationClick(conversation) {
    activeConversationId = conversation.id;
    localStorage.setItem('activeConversationId', activeConversationId);

    setCurrentConversation(conversation.id);
    displayMessagesForConversation(conversation.id);
    bindMessageSendEvent(conversation.id, userId);

    document.querySelector(`[data-conversation-id="${conversation.id}"] #notif`).textContent = "";
    document.getElementById("messageInput").focus();
}



// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    fetchAndDisplayUser();
    fetchUsers();
    fetchAndDisplayConversations();

    if (activeConversationId) {
        setCurrentConversation(activeConversationId);
        displayMessagesForConversation(activeConversationId);
    }

    document.getElementById('logOut').addEventListener('click', handleLogout);

    // Register service worker
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registered with scope:', registration.scope))
            .catch(error => console.error('Service Worker registration failed:', error));
    }
}

function handleLogout() {
    pb.authStore.clear();
    window.location.href = "/login.html";
}
