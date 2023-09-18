import pb from "./pbInit.js";
import { createElementWithAttributes, fetchCollectionItems } from './utils.js';

async function fetchAndDisplayConversations(userId) {
    try {
        const conversations = await fetchCollectionItems("conversations", { filter: `participants ~ "${userId}"` });

        const conversationsList = document.getElementById("conversationsList");
        if (conversationsList) {
            conversations.items.forEach(conversation => {
                const conversationElement = createConversationElement(conversation);
                conversationsList.appendChild(conversationElement);
            });
        }

    } catch (error) {
        console.error("Error fetching and displaying conversations:", error);
    }
}

function createConversationElement(conversation) {
    const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
    // Use conversation.image if available, else use the default image URL
    const imageUrl = conversation.image || DEFAULT_IMAGE_URL;

    const li = createElementWithAttributes("li", {
        class: "flex justify-between px-1 py-3",
        'data-conversation-id': conversation.id
    });

    li.innerHTML = `
        <div class="flex min-w-0 gap-x-4">
            <img class="h-14 w-14 flex-none border border-gray-50 rounded-full" src="${imageUrl}" alt="">
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

export { fetchAndDisplayConversations };
