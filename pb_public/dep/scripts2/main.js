import { initializeApp, handleLogout } from './appInit.js';
import { fetchAndDisplayConversations } from './displayConversation.js';
import { displayMessagesForConversation } from './messages.js';
import { realTimeConnection } from './realTime.js';
import { sendNotification, requestNotificationPermission } from './notifications.js';

document.addEventListener("DOMContentLoaded", function() {
    initializeApp();

    // Add your event listeners or initial function calls
    // For example:
    const userId = "YOUR_USER_ID"; // Replace with your logic
    fetchAndDisplayConversations(userId);
    
    // Listen for logout action, just as an example:
    document.getElementById("logoutButton").addEventListener("click", handleLogout);

    // Placeholder: Start real-time listeners
    realTimeConnection.listenForMessages();
    realTimeConnection.listenForConversations();

    // Request notification permission on load
    requestNotificationPermission();
});

// You can add more core logic or functions as needed.
