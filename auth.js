document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const profileModal = document.getElementById('profileModal');
    const loginButton = document.querySelector('.login-button');
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileImage = document.querySelector('.profile-image');
    const profileIcon = document.querySelector('.profile-icon');
    const closeButtons = document.querySelectorAll('.close-modal');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const googleButtons = document.querySelectorAll('.google-auth-button');

    console.log('Modal elements:', {
        loginModal,
        signupModal,
        profileModal,
        loginButton,
        profileAvatar,
        profileImage,
        profileIcon,
        closeButtons,
        showSignupLink,
        showLoginLink,
        googleButtons
    });

    // Profile modal elements
    const profileModalImage = document.querySelector('.profile-modal-image');
    const profileModalIcon = document.querySelector('.profile-modal-icon');
    const profileModalName = document.querySelector('.profile-modal-name');
    const profileModalEmail = document.querySelector('.profile-modal-email');
    const logoutButton = document.querySelector('.logout-button');

    // Form elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Show login modal
    loginButton.addEventListener('click', (e) => {
        console.log('Login button clicked');
        e.preventDefault();
        loginModal.style.display = 'block';
        console.log('Login modal display set to:', loginModal.style.display);
    });

    // Show signup modal
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'block';
    });

    // Show login modal from signup
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
            profileModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
        }
        // Don't close profile modal when clicking inside it
        if (!e.target.closest('.profile-modal-content') && !e.target.closest('.profile-avatar')) {
            profileModal.style.display = 'none';
        }
    });

    // Handle Google authentication
    googleButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = '/auth/google';
        });
    });

    // Check authentication status
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth/status', {
                credentials: 'include', // Important for session cookies
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const data = await response.json();
            
            if (data.isAuthenticated) {
                // Hide login button and show profile avatar
                loginButton.style.display = 'none';
                profileAvatar.style.display = 'flex';
                
                // Update profile modal info
                profileModalName.textContent = data.user.name;
                profileModalEmail.textContent = data.user.email;

                // If user has a profile image, show it, otherwise show default icon
                if (data.user.profile_image && data.user.profile_image !== 'null' && data.user.profile_image !== 'undefined') {
                    // Profile avatar in header
                    profileImage.src = data.user.profile_image;
                    profileImage.style.display = 'block';
                    profileIcon.style.display = 'none';
                    
                    // Profile modal image
                    profileModalImage.src = data.user.profile_image;
                    profileModalImage.style.display = 'block';
                    profileModalIcon.style.display = 'none';
                } else {
                    // Profile avatar in header
                    profileImage.style.display = 'none';
                    profileIcon.style.display = 'block';
                    profileIcon.innerHTML = '<i class="fas fa-user"></i>';
                    
                    // Profile modal image
                    profileModalImage.style.display = 'none';
                    profileModalIcon.style.display = 'block';
                    profileModalIcon.innerHTML = '<i class="fas fa-user"></i>';
                }
            } else {
                // Show login button and hide profile avatar
                loginButton.style.display = 'block';
                profileAvatar.style.display = 'none';
                profileModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    // Toggle profile modal
    profileAvatar.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        const isVisible = profileModal.style.display === 'block';
        profileModal.style.display = isVisible ? 'none' : 'block';
    });

    // Handle logout
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/logout');
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });

    // Check auth status on page load and periodically
    checkAuthStatus();
    setInterval(checkAuthStatus, 30000); // Check every 30 seconds

    // Validation functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPassword(password) {
        return password.length >= 4;
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validate email
        if (!isValidEmail(email)) {
            showMessage(loginForm, 'Please enter a valid email address', 'error');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Clear form
                loginForm.reset();
                
                // Hide login modal
                loginModal.style.display = 'none';
                
                // Update UI
                loginButton.style.display = 'none';
                profileAvatar.style.display = 'flex';
                
                // Update profile info
                profileModalName.textContent = data.user.name;
                profileModalEmail.textContent = data.user.email;
                
                // Handle profile image
                if (data.user.profile_image) {
                    profileImage.src = data.user.profile_image;
                    profileImage.style.display = 'block';
                    profileIcon.style.display = 'none';
                    profileModalImage.src = data.user.profile_image;
                    profileModalImage.style.display = 'block';
                    profileModalIcon.style.display = 'none';
                }
                
                // Reload page to ensure session is properly established
                window.location.reload();
            } else {
                showMessage(loginForm, data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(loginForm, 'An error occurred during login', 'error');
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const nickname = document.getElementById('signupNickname').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate email
        if (!isValidEmail(email)) {
            showMessage(signupForm, 'Please enter a valid email address', 'error');
            return;
        }

        // Validate password
        if (!isValidPassword(password)) {
            showMessage(signupForm, 'Password must be at least 4 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(signupForm, 'Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({ 
                    name,
                    nickname: nickname || null,
                    email, 
                    password 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(signupForm, 'Account created successfully!', 'success');
                // Update UI immediately
                loginButton.style.display = 'none';
                profileAvatar.style.display = 'flex';
                
                // Update profile modal info
                profileModalName.textContent = name;
                profileModalEmail.textContent = email;

                // Update profile image
                profileImage.style.display = 'none';
                profileIcon.style.display = 'block';
                profileModalImage.style.display = 'none';
                profileModalIcon.style.display = 'block';

                setTimeout(() => {
                    signupModal.style.display = 'none';
                }, 1500);
            } else {
                showMessage(signupForm, data.error, 'error');
            }
        } catch (error) {
            showMessage(signupForm, 'An error occurred. Please try again.', 'error');
        }
    });

    // Helper function to show messages
    function showMessage(form, message, type) {
        // Remove any existing messages
        const existingMessage = form.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message element
        const messageElement = document.createElement('div');
        messageElement.className = type === 'error' ? 'error-message' : 'success-message';
        messageElement.textContent = message;
        form.appendChild(messageElement);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    function createProfileDropdown(user) {
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-modal';
        dropdown.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-modal-header">
                    <div class="profile-modal-avatar">
                        ${user.profile_image ? 
                            `<img class="profile-modal-image" src="${user.profile_image}" alt="Profile">` : 
                            `<i class="fas fa-user profile-modal-icon"></i>`
                        }
                    </div>
                    <div class="profile-modal-name">${user.name}</div>
                    <div class="profile-modal-email">${user.email}</div>
                </div>
                <div class="profile-modal-menu">
                    <a href="/profile.html" class="profile-menu-item" id="profileLink">
                        <i class="fas fa-user-edit"></i>
                        <span>Edit Profile</span>
                    </a>
                    <a href="#" class="profile-menu-item">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <button class="logout-button">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        `;

        // Add click event listener to the logout button
        const logoutButton = dropdown.querySelector('.logout-button');
        logoutButton.addEventListener('click', handleLogout);

        // Add click event listener to the profile link
        const profileLink = dropdown.querySelector('#profileLink');
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/profile.html';
        });

        return dropdown;
    }
}); 