import pb from "./pbInit.js";

function createElementWithAttributes(tag, attributes) {
    const element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

async function fetchAndDisplayConversations(userId) {
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

async function fetchCollectionItems(collectionName, params = {}) {
    return await pb.collection(collectionName).getList(1, 30, params);
}

export { fetchAndDisplayConversations };
