import pb from "./pbInit.js";
import { fetchCollectionItems } from "./utils.js";

// Redirect if not authenticated
if (!pb.authStore.isValid) {
    window.location.href = "/";
}

const userId = pb.authStore.model.id;
let userMap = {};  // This will store the mapping of userID -> username

export async function fetchAndDisplayUser() {
    const record = await fetchCollectionItems("users", { id: userId });
    if (record && record.avatar) {
        document.querySelector("#personalInfo img").src = `api/files/_pb_users_auth_/${userId}/${record.avatar}`;
    }
}

export async function fetchUsers() {
    const users = await fetchCollectionItems("users");
    users.items.forEach(user => userMap[user.id] = user.username);
}
