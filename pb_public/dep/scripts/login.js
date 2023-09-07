import pb from "./pbInit.js";


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); // Assuming your form's ID is 'loginForm'

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const authData = await pb.collection('users').authWithPassword(username, password);
                
            if (authData) {
                // Successfully authenticated, redirecting to main.html
                window.location.href = "/main.html";
            } else {
                alert('Error logging in. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
