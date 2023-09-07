import PocketBase from "/dep/js-sdk-master/dist/pocketbase.es.js";
import { setCurrentConversation } from "./realTime.js";


const pb = new PocketBase("http://127.0.0.1:8090");

if (!pb.authStore.isValid) {
    window.location.href = "http://127.0.0.1:8090";
}
console.log(pb.authStore.model.id);
let activeConversationId = null;
let userid=pb.authStore.model.id

// Variables
let clickHandler = null;
let keydownHandler = null;

// Display user's avatar
async function fetchAndDisplayUser() {
    const id = pb.authStore.model.id;
    const record = await pb.collection("users").getOne(id, {});

    if (record && record.avatar) {
        const personalInfoImg = document.querySelector("#personalInfo img");
        personalInfoImg.src = "api/files/_pb_users_auth_/" + id + "/" + record.avatar;
    }
}
let userMap = {};  // This will store the mapping of userID -> username

fetchAndDisplayUser();
async function fetchUsers() {
    const users = await pb.collection("users").getList(1, 1000, {}); // Adjust the number accordingly
    users.items.forEach(user => {
        userMap[user.id] = user.username;
    });
}

// Call this function to populate the userMap
fetchUsers();
// Display messages for a given conversation
async function displayMessagesForConversation(conversationId) {
    const filterQuery = `conversation="${conversationId}"`;
    const messages = await pb.collection("messages").getList(1, 25, {
        filter: filterQuery,
        sort: "-created",
        expand: 'sender'
    });

    const messagesList = document.getElementById("messagesList");
    messagesList.innerHTML = ''; // Clear previous messages

    const reversedMessages = messages.items.reverse();
    reversedMessages.forEach(message => {
        const li = document.createElement("li");
        li.classList.add("p-2", "my-1", "rounded-lg", "bg-white");
        li.innerHTML = `
            <div class="flex">
                <img class="h-8 ml-2 w-8 border border-gray-900 relative right-2 flex-none rounded-full" src="api/files/_pb_users_auth_/${message.sender}/${message.expand.sender.avatar}" alt="">
                <br></br>
                <p class="mr-1 font-semibold">${userMap[message.sender]}</p>
                <p>${message.message}</p>
            </div>
            <div>
                <small class="text-gray-500">${new Date(message.created).toLocaleTimeString()}</small>
            </div>
        `;
        messagesList.appendChild(li);
    });
    chatArea.scrollTop = chatArea.scrollHeight + 100;
}




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

// Display conversations
async function fetchAndDisplayConversations() {
    const id = pb.authStore.model.id;
    const filterQuery = `participants ~ "${id}"`;
    const resultList = await pb.collection("conversations").getList(1, 50, {
        filter: filterQuery,
    });

    const ulElement = document.getElementById("conversationsList");
    resultList.items.forEach(conversation => {
        const li = document.createElement("li");
        li.classList.add("flex", "justify-between", "px-1", "py-3");
        li.setAttribute('data-conversation-id', conversation.id); // Add a data attribute to easily find the conversation element later
        li.innerHTML = `
        <div class="flex min-w-0 gap-x-4">
            <img class="h-14 w-14 flex-none border border-gray-50 rounded-full " src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
            <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibol leading-6 text-gray-50">${conversation.name}</p>
            </div>
        </div>
        <div class="shrink-0 sm:flex sm:flex-col sm:items-end">
            <p id="notif" class="text-sm leading-6 text-gray-50"></p>
        </div>
    `;

    li.addEventListener("click", () => {

        activeConversationId = conversation.id;

        // Save the active conversation ID to localStorage
       localStorage.setItem('activeConversationId', activeConversationId);

        setCurrentConversation(conversation.id); // Update current conversation ID in realTime.js module
        displayMessagesForConversation(conversation.id);
        bindMessageSendEvent(conversation.id, id);
        
        // Clear the "new messages" indication
        const notifElement = li.querySelector("#notif");
        notifElement.textContent = "";
        
        document.getElementById("messageInput").focus();
    });
    ulElement.appendChild(li);
});
}

fetchAndDisplayConversations();

document.addEventListener('DOMContentLoaded', () => {

    const savedActiveConversationId = localStorage.getItem('activeConversationId');
    if (savedActiveConversationId) {
        activeConversationId = savedActiveConversationId;
        setCurrentConversation(activeConversationId);
        displayMessagesForConversation(activeConversationId);
    }

    const logoutButton = document.getElementById('logOut');

    logoutButton.addEventListener('click', () => {
        pb.authStore.clear();

        window.location.href = "/login.html"; // Replace with your login page URL if different
    });
});
// main.js

if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function (error) {
        console.error('Service Worker registration failed:', error);
    });
}
