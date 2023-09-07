self.addEventListener('push', function (event) {
    let data = {};
    console.log("worked")

    if (event.data) {
        try {
            data = "event.data.json()";
        } catch (e) {
            data = {
                title: 'Default Title',
                body: event.data.text()  // Using the plain text data directly as the notification body
            };
        }
    }

    const title = data.title || 'Fallback Title';
    const options = {
        body: data.body || 'Fallback Body',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
