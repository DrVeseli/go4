import pb from "./pbInit.js";

let currentConversationId = null;
let userMap = {};  // Mapping of userID -> username

// Fetch all users and populate the userMap.
async function fetchUsers() {
    const users = await pb.collection("users").getList(1, 50, {});
    users.items.forEach(user => {
        userMap[user.id] = user.username;
    });
}

// Display a single incoming message.
function displayIncomingMessage(message) {
    const messagesList = document.getElementById("messagesList");
    const li = document.createElement("li");
    li.classList.add("p-2", "my-1", "rounded-lg", "bg-white");
    li.innerHTML = `
        <div class="flex">
            <p class="mr-1 font-semibold">${userMap[message.sender]}</p>
            <p>${message.message}</p>
        </div>
        <div>
            <small class="text-gray-500">${new Date(message.created).toLocaleTimeString()}</small>
        </div>
    `;
    messagesList.appendChild(li);
    chatArea.scrollTop = chatArea.scrollHeight + 100;
}

function handleIncomingMessage(e) {
    if (e.record.conversation === currentConversationId) {
        displayIncomingMessage(e.record);
    } else {
        sendNotification('New Message', 'You have a new message in another conversation.');
    }
}

function handleIncomingConversation(e) {
    addConversationToList(e.record);
    sendNotification('New Conversation', 'You have a new conversation.');
}

function addConversationToList(conversation) {
    const id = pb.authStore.model.id;
    const ulElement = document.getElementById("conversationsList");
    const li = document.createElement("li");
    li.classList.add("flex", "justify-between", "px-1", "py-3");
    li.setAttribute('data-conversation-id', conversation.id);
    li.innerHTML = `
        <div class="flex min-w-0 gap-x-4">
            <img class="h-14 w-14 flex-none border border-gray-50 rounded-full " src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="">
            <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibol leading-6 text-gray-50">${conversation.name}</p>
            </div>
        </div>
        <div class="shrink-0 sm:flex sm:flex-col sm:items-end">
            <p class="notif text-sm leading-6 text-gray-50"></p> 
        </div>
    `;

    li.addEventListener("click", () => {
        activeConversationId = conversation.id;
        setCurrentConversation(conversation.id);
        displayMessagesForConversation(conversation.id);
        bindMessageSendEvent(conversation.id, id);
        
        // Clear the "new messages" indication
        const notifElement = li.querySelector(".notif");
        notifElement.textContent = "";
        
        document.getElementById("messageInput").focus();
    });
    ulElement.appendChild(li);
}

function setCurrentConversation(conversationId) {
    currentConversationId = conversationId;
    const conversationElement = document.querySelector(`[data-conversation-id="${conversationId}"] .notif`);
    if (conversationElement) {
        conversationElement.textContent = "";
    }
}

function sendNotification(conversation, body) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(conversation, {
                body: "new message",
                title: "one message"
            });
        });
    }
}

function requestNotificationPermission() {
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            // You can now show a notification
        } else {
            console.error('Notification permission not granted.');
        }
    });
}

// Initialization code
document.addEventListener('DOMContentLoaded', () => {
    // Fetch user data
    fetchUsers();

    // Request notifications permission
    document.getElementById('enableNotifications').addEventListener('click', function() {
        requestNotificationPermission();
    });

    // Subscribe to PocketBase collections
    pb.collection('messages').subscribe('*', handleIncomingMessage);
    pb.collection('conversations').subscribe('*', handleIncomingConversation);
});

export { setCurrentConversation, addConversationToList };
