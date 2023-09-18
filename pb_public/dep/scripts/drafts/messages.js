import pb from "./pbInit.js";

function createElementWithAttributes(tag, attributes) {
    const element = document.createElement(tag);
    for (let key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

async function fetchCollectionItems(collectionName, params = {}) {
    return await pb.collection(collectionName).getList(1, 30, params);
}

async function displayMessagesForConversation(conversationId, userMap) {
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

    document.getElementById("chatArea").scrollTop = chatArea.scrollHeight + 100;
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
