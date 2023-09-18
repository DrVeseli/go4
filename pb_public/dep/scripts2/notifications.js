function sendNotification(title, options = {}) {
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notification");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
        requestNotificationPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, options);
            }
        });
    }
}

function requestNotificationPermission() {
    return new Promise((resolve, reject) => {
        Notification.requestPermission().then(permission => {
            resolve(permission);
        });
    });
}

export { sendNotification, requestNotificationPermission };
