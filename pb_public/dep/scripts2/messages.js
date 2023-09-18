import pb from "./pbInit.js";
import { createElementWithAttributes, fetchCollectionItems } from './utils.js';

async function displayMessagesForConversation(conversationId, userMap) {
    try {
        const messages = await fetchCollectionItems("messages", {
            filter: `conversation="${conversationId}"`,
            sort: "-created",
            expand: 'sender'
        });

        const messagesList = document.getElementById("messagesList");
        messagesList.innerHTML = ''; // Clear previous messages

        messages.items.reverse().forEach(message => {
            const messageElement = createMessageElement(message, userMap);
            messagesList.appendChild(messageElement);
        });

        const chatArea = document.getElementById("chatArea");
        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight + 100;
        }

    } catch (error) {
        console.error("Error displaying messages:", error);
    }
}

function createMessageElement(message, userMap) {
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

export { displayMessagesForConversation };
