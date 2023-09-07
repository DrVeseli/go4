import pb from "./pbInit.js";







//CREATES THE ACCOUND



document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        // Basic validations
        if (password.length < 5) {
            alert('Password must be at least 5 characters long.');
            return;
        }

        if (password !== passwordConfirm) {
            alert('Passwords do not match.');
            return;
        }

        const userData = {
            username,
            email,
            emailVisibility: true, 
            password,
            passwordConfirm,
            avatar: "http://127.0.0.1:8090/dep/assets/bearavatar.png"
        };

        try {
            const record = await pb.collection('users').create(userData);
            
            if (record) {
                // User created successfully, try to log them in
                const authData = await pb.collection('users').authWithPassword(email, password);
                
                if (authData) {
                    // Successfully authenticated, redirecting to main.html
                    window.location.href = '/main.html';
                } else {
                    alert('Successfully registered but error logging in. Please login manually.');
                }

            } else {
                alert('Error creating user. Please try again.');
            }

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});
console.log(pb.authStore.isValid);
console.log(pb.authStore.token);
console.log(pb.authStore.model.id);

if (!pb.authStore.isValid) {
    window.location.href = "/main.html";
}