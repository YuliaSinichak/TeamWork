function parseJwt (token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Helper function to show notifications
function showNotification(message, isError = false) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    if (isError) {
        notification.style.backgroundColor = '#f44336'; // Red for errors
    } else {
        notification.style.backgroundColor = '#4CAF50'; // Green for success
    }
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 500);
    }, 3000);
}

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
    const adminPanel = document.getElementById('admin-panel');

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
            const resourceDiv = document.createElement('div');
            resourceDiv.className = 'resource-item';
            resourceDiv.innerHTML = `
                <h3>${resource.title}</h3>
                <p><strong>Author:</strong> ${resource.author ? resource.author.first_name : 'N/A'}</p>
                <p><strong>Type:</strong> ${resource.resource_type}</p>
                <p><strong>Status:</strong> ${resource.status}</p>
                <a href="${apiBaseUrl.replace('/api/v1', '')}/${resource.url}" target="_blank">View Resource</a>
            `;

            const userId = localStorage.getItem('userId');
            if (resource.author_id == userId) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.className = 'delete-btn';
                deleteBtn.onclick = () => deleteResource(resource.id);
                resourceDiv.appendChild(deleteBtn);
            }

            resourceList.appendChild(resourceDiv);
        });
    }

    async function deleteResource(resourceId) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${apiBaseUrl}/resources/${resourceId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showNotification('Resource deleted successfully!');
                fetchResources(); // Refresh the list of user's resources
            } else {
                const error = await response.json();
                showNotification(`Error deleting resource: ${error.detail}`, true);
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert('An error occurred while deleting the resource.');
        }
    }

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
            const response = await fetch(`${apiBaseUrl}/auth/login/access-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'username': email,
                    'password': password
                })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Login successful!');
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.first_name);

                loginForm.style.display = 'none';
                registerForm.style.display = 'none';
                logoutBtn.style.display = 'block';
                mainContainer.style.display = 'block'; // Changed from content to mainContainer
                document.getElementById('user-name').textContent = data.user.first_name;

                fetchResources(); // Changed from fetchMyResources to fetchResources
                
                const decodedToken = parseJwt(data.access_token);
                if (decodedToken && decodedToken.role === 'admin') {
                    adminPanel.style.display = 'block';
                    fetchPendingResources();
                }

            } else {
                showNotification(`Login failed: ${data.detail}`, true);
            }
        } catch (error) {
            console.error('Error during login:', error);
            showNotification('An error occurred during login.', true);
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
            showNotification('Registration successful! Please log in.');
            showLoginLink.click();
            // Clear registration form
            document.getElementById('register-name').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
        } catch (error) {
            showNotification(`Registration failed: ${error.detail}`, true);
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        showAuth();
    });

    // Initial check
    if (token) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        logoutBtn.style.display = 'block';
        mainContainer.style.display = 'block'; // Changed from content to mainContainer
        document.getElementById('user-name').textContent = localStorage.getItem('userName');
        fetchResources();

        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.role === 'admin') {
            adminPanel.style.display = 'block';
            fetchPendingResources();
        }
    } else {
        showAuth();
    }

    async function fetchPendingResources() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${apiBaseUrl}/resources/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resources = await response.json();
            displayPendingResources(resources);
        } catch (error) {
            console.error('Error fetching pending resources:', error);
        }
    }

    function displayPendingResources(resources) {
        const pendingList = document.getElementById('pending-resource-list');
        pendingList.innerHTML = '';
        resources.forEach(resource => {
            const resourceDiv = document.createElement('div');
            resourceDiv.className = 'resource-item';
            resourceDiv.innerHTML = `
                <h3>${resource.title}</h3>
                <p>Uploaded by: ${resource.author_id}</p>
                <a href="${apiBaseUrl.replace('/api/v1', '')}/${resource.url}" target="_blank">View Resource</a>
                <div>
                    <button class="approve-btn" data-id="${resource.id}">Approve</button>
                    <button class="reject-btn" data-id="${resource.id}">Reject</button>
                </div>
            `;
            pendingList.appendChild(resourceDiv);
        });

        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', (e) => updateResourceStatus(e.target.dataset.id, 'approved'));
        });

        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', (e) => updateResourceStatus(e.target.dataset.id, 'rejected'));
        });
    }

    async function updateResourceStatus(resourceId, status) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${apiBaseUrl}/resources/${resourceId}/status?status=${status}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showNotification(`Resource status updated to ${status}`);
                fetchPendingResources(); // Refresh the list
            } else {
                const error = await response.json();
                showNotification(`Error updating status: ${error.detail}`, true);
            }
        } catch (error) {
            console.error('Error updating resource status:', error);
        }
    }


    // Initial Check on Load
    const decodedToken = parseJwt(token);
    if (decodedToken && decodedToken.role === 'admin') {
        adminPanel.style.display = 'block';
        fetchPendingResources();
    }
});
