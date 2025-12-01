document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost:8000/api/v1';

    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const userEmailSpan = document.getElementById('user-email');
    const resourceList = document.getElementById('resource-list');

    // State
    let token = localStorage.getItem('token');

    // Functions
    const showAuth = () => {
        authContainer.classList.remove('hidden');
        mainContainer.classList.add('hidden');
    };

    const showMain = () => {
        authContainer.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        fetchResources();
    };

    const fetchResources = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/resources/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch resources');
            const resources = await response.json();
            renderResources(resources);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };
    
    const renderResources = (resources) => {
        resourceList.innerHTML = '';
        if (resources.length === 0) {
            resourceList.innerHTML = '<p>No resources found.</p>';
            return;
        }
        resources.forEach(resource => {
            const item = document.createElement('div');
            item.className = 'resource-item';
            item.innerHTML = `
                <h3>${resource.title}</h3>
                <p>Type: ${resource.resource_type}</p>
                <p>Author: ${resource.author.email}</p>
            `;
            resourceList.appendChild(item);
        });
    };

    // Event Listeners
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch(`${apiBaseUrl}/login/access-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'username': email,
                    'password': password
                })
            });
            if (!response.ok) throw new Error('Login failed');
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem('token', token);
            showMain();
        } catch (error) {
            alert(error.message);
        }
    });

    registerBtn.addEventListener('click', async () => {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const firstName = document.getElementById('register-name').value;
        const role = document.getElementById('register-role').value;

        try {
            const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    role,
                    is_active: true,
                    is_superuser: false,
                    is_approved_teacher: false
                })
            });
            if (!response.ok) throw new Error('Registration failed');
            alert('Registration successful! Please login.');
            showLoginLink.click();
            // Clear registration form
            document.getElementById('register-name').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
        } catch (error) {
            alert(error.message);
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        token = null;
        localStorage.removeItem('token');
        showAuth();
    });

    // Initial check
    if (token) {
        showMain();
    } else {
        showAuth();
    }
});
