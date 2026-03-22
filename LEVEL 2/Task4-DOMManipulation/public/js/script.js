// ========== STATE MANAGEMENT ==========
let users = [];
let currentPage = 'home';

// ========== THEME MANAGEMENT ==========
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle button visual state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (savedTheme === 'dark') {
            themeToggle.classList.add('dark');
        } else {
            themeToggle.classList.remove('dark');
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Animate toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Update user preferences if logged in
    const latestUser = users[users.length - 1];
    if (latestUser) {
        updatePreferences({ 
            id: latestUser.id, 
            darkMode: newTheme === 'dark' 
        }).catch(console.error);
    }
    
    // Theme messages
    const themeName = newTheme === 'dark' ? 'Dark Mode (Pink Theme)' : 'Light Mode (Black & Gold)';
    showToast(`${themeName} activated`, 'info');
}

// ========== API FUNCTIONS ==========
async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        users = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

async function registerUser(formData) {
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    return await response.json();
}

async function checkUsername(username) {
    const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });
    return await response.json();
}

async function updateProfile(data) {
    const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function updatePreferences(data) {
    const response = await fetch('/api/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await response.json();
}

async function deleteUser(userId) {
    const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
    });
    return await response.json();
}

// ========== UI FUNCTIONS ==========
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== PASSWORD STRENGTH CHECKER ==========
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar) return;
    
    let strength = 0;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
    
    // Update requirement indicators
    const reqIds = ['req-length', 'req-uppercase', 'req-lowercase', 'req-number', 'req-special'];
    const reqNames = ['length', 'uppercase', 'lowercase', 'number', 'special'];
    
    reqIds.forEach((id, index) => {
        const element = document.getElementById(id);
        const reqName = reqNames[index];
        if (element) {
            if (requirements[reqName]) {
                element.classList.add('valid');
                element.classList.remove('invalid');
                element.innerHTML = '<i class="fas fa-check-circle"></i> ' + element.textContent.replace(/[✓✗]/g, '').trim();
            } else {
                element.classList.add('invalid');
                element.classList.remove('valid');
                element.innerHTML = '<i class="fas fa-circle"></i> ' + element.textContent.replace(/[✓✗]/g, '').trim();
            }
        }
    });
    
    // Calculate strength
    if (requirements.length) strength++;
    if (requirements.uppercase) strength++;
    if (requirements.lowercase) strength++;
    if (requirements.number) strength++;
    if (requirements.special) strength++;
    
    if (password.length === 0) {
        strengthBar.className = 'strength-bar';
        if (strengthText) strengthText.innerHTML = 'Strength: <span>Not entered</span>';
    } else if (strength <= 2) {
        strengthBar.className = 'strength-bar weak';
        if (strengthText) strengthText.innerHTML = 'Strength: <span class="weak">Weak</span>';
    } else if (strength === 3) {
        strengthBar.className = 'strength-bar medium';
        if (strengthText) strengthText.innerHTML = 'Strength: <span class="medium">Medium</span>';
    } else if (strength === 4) {
        strengthBar.className = 'strength-bar strong';
        if (strengthText) strengthText.innerHTML = 'Strength: <span class="strong">Strong</span>';
    } else {
        strengthBar.className = 'strength-bar very-strong';
        if (strengthText) strengthText.innerHTML = 'Strength: <span class="very-strong">Very Strong</span>';
    }
    
    return requirements;
}

// ========== PAGE RENDERING ==========
async function renderPage(page) {
    currentPage = page;
    const contentDiv = document.getElementById('pageContent');
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    switch(page) {
        case 'home':
            contentDiv.innerHTML = renderHomePage();
            attachHomeEvents();
            break;
        case 'profile':
            await fetchUsers();
            contentDiv.innerHTML = renderProfilePage();
            attachProfileEvents();
            break;
        case 'dashboard':
            await fetchUsers();
            contentDiv.innerHTML = renderDashboardPage();
            attachDashboardEvents();
            break;
        default:
            contentDiv.innerHTML = renderHomePage();
            attachHomeEvents();
    }
}

function renderHomePage() {
    return `
        <div class="row">
            <div class="col-lg-7 mx-auto">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-user-plus"></i> Create Account</h3>
                        <p class="text-muted mb-0">Join the Himstun experience</p>
                    </div>
                    <div class="card-body">
                        <form id="registrationForm">
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-user"></i> Username</label>
                                <input type="text" name="username" class="form-control" id="username" placeholder="john_doe" required>
                                <div class="invalid-feedback" id="usernameError"></div>
                                <small class="text-muted" id="usernameStatus"></small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-envelope"></i> Email</label>
                                <input type="email" name="email" class="form-control" id="email" placeholder="john@example.com" required>
                                <div class="invalid-feedback" id="emailError"></div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-phone"></i> Phone Number</label>
                                <input type="tel" name="phone" class="form-control" id="phone" maxlength="10" placeholder="1234567890" required>
                                <div class="invalid-feedback" id="phoneError"></div>
                                <small class="text-muted"><span id="phoneCount">0</span>/10 digits</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-lock"></i> Password</label>
                                <input type="password" name="password" class="form-control" id="password" required>
                                <div class="password-strength mt-2">
                                    <div class="strength-meter">
                                        <div class="strength-bar" id="strengthBar"></div>
                                    </div>
                                    <div class="strength-text" id="strengthText">Strength: <span>Not entered</span></div>
                                </div>
                                <div class="password-requirements mt-2">
                                    <ul class="list-unstyled">
                                        <li id="req-length"><i class="fas fa-circle"></i> At least 8 characters</li>
                                        <li id="req-uppercase"><i class="fas fa-circle"></i> At least one uppercase</li>
                                        <li id="req-lowercase"><i class="fas fa-circle"></i> At least one lowercase</li>
                                        <li id="req-number"><i class="fas fa-circle"></i> At least one number</li>
                                        <li id="req-special"><i class="fas fa-circle"></i> At least one special (!@#$%^&*)</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-lock"></i> Confirm Password</label>
                                <input type="password" name="confirmPassword" class="form-control" id="confirmPassword" required>
                                <div class="invalid-feedback" id="confirmError"></div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-calendar-alt"></i> Age</label>
                                <input type="number" name="age" class="form-control" id="age" min="18" max="100" placeholder="25" required>
                                <div class="invalid-feedback" id="ageError"></div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label"><i class="fas fa-globe"></i> Country</label>
                                <select name="country" class="form-select" id="country">
                                    <option value="">Select Country</option>
                                    <option value="USA">United States</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                    <option value="India">India</option>
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="terms">
                                    <label class="form-check-label">
                                        I agree to the <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">Terms & Conditions</a>
                                    </label>
                                    <div class="invalid-feedback" id="termsError"></div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100" id="submitBtn">
                                <i class="fas fa-check-circle"></i> Register
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProfilePage() {
    const latestUser = users.length > 0 ? users[users.length - 1] : null;
    
    if (!latestUser) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-user-circle fa-4x text-muted mb-3"></i>
                <h3>No User Found</h3>
                <p class="text-muted">Please register first to view your profile.</p>
                <button class="btn btn-primary" onclick="renderPage('home')">Register Now</button>
            </div>
        `;
    }
    
    return `
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-user-circle"></i> My Profile</h3>
                        <p class="text-muted mb-0">View and manage your account</p>
                    </div>
                    <div class="card-body">
                        <div id="profileView">
                            <div class="row">
                                <div class="col-md-8 mx-auto text-center">
                                    <i class="fas fa-user-circle fa-5x text-primary mb-3"></i>
                                    <h2>${escapeHtml(latestUser.username)}</h2>
                                    <p class="text-muted">Member since ${new Date(latestUser.registeredAt).toLocaleDateString()}</p>
                                </div>
                                <div class="col-md-8 mx-auto mt-4">
                                    <div class="info-row d-flex justify-content-between py-2 border-bottom">
                                        <span><i class="fas fa-envelope text-primary"></i> Email:</span>
                                        <span>${escapeHtml(latestUser.email)}</span>
                                    </div>
                                    <div class="info-row d-flex justify-content-between py-2 border-bottom">
                                        <span><i class="fas fa-phone text-primary"></i> Phone:</span>
                                        <span>${latestUser.phone}</span>
                                    </div>
                                    <div class="info-row d-flex justify-content-between py-2 border-bottom">
                                        <span><i class="fas fa-calendar-alt text-primary"></i> Age:</span>
                                        <span>${latestUser.age} years</span>
                                    </div>
                                    <div class="info-row d-flex justify-content-between py-2">
                                        <span><i class="fas fa-globe text-primary"></i> Country:</span>
                                        <span>${latestUser.country}</span>
                                    </div>
                                </div>
                                <div class="text-center mt-4">
                                    <button class="btn btn-primary" onclick="startEditProfile(${latestUser.id})">
                                        <i class="fas fa-edit"></i> Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div id="profileEdit" style="display: none;">
                            <form id="editProfileForm">
                                <input type="hidden" name="id" value="${latestUser.id}">
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" name="username" class="form-control" value="${escapeHtml(latestUser.username)}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" name="email" class="form-control" value="${escapeHtml(latestUser.email)}" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Phone</label>
                                    <input type="tel" name="phone" class="form-control" value="${latestUser.phone}" maxlength="10" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Age</label>
                                    <input type="number" name="age" class="form-control" value="${latestUser.age}" min="18" max="100" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Country</label>
                                    <select name="country" class="form-select">
                                        <option value="USA" ${latestUser.country === 'USA' ? 'selected' : ''}>USA</option>
                                        <option value="UK" ${latestUser.country === 'UK' ? 'selected' : ''}>UK</option>
                                        <option value="Canada" ${latestUser.country === 'Canada' ? 'selected' : ''}>Canada</option>
                                        <option value="Australia" ${latestUser.country === 'Australia' ? 'selected' : ''}>Australia</option>
                                        <option value="India" ${latestUser.country === 'India' ? 'selected' : ''}>India</option>
                                    </select>
                                </div>
                                <div class="d-flex gap-2">
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                    <button type="button" class="btn btn-outline-secondary" onclick="cancelEditProfile()">Cancel</button>
                                </div>
                            </form>
                        </div>
                        
                        <hr class="my-4">
                        
                        <h4><i class="fas fa-cog"></i> Settings</h4>
                        <div class="settings-panel mt-3">
                            <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                                <div>
                                    <i class="fas fa-moon"></i> Dark Mode
                                    <div class="small text-muted">Toggle pink theme / black & gold theme</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="darkModeToggle" ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
                                <div>
                                    <i class="fas fa-language"></i> Language
                                    <div class="small text-muted">Select your preferred language</div>
                                </div>
                                <select id="languageSelect" class="form-select w-auto">
                                    <option value="english" ${latestUser.preferences?.language === 'english' ? 'selected' : ''}>English</option>
                                    <option value="hindi" ${latestUser.preferences?.language === 'hindi' ? 'selected' : ''}>हिंदी</option>
                                    <option value="kannada" ${latestUser.preferences?.language === 'kannada' ? 'selected' : ''}>ಕನ್ನಡ</option>
                                    <option value="telugu" ${latestUser.preferences?.language === 'telugu' ? 'selected' : ''}>తెలుగు</option>
                                </select>
                            </div>
                            <div class="d-flex justify-content-between align-items-center py-3">
                                <div>
                                    <i class="fas fa-bell"></i> Notifications
                                    <div class="small text-muted">Receive email notifications</div>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="notificationToggle" ${latestUser.preferences?.notifications !== false ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <hr class="my-4">
                        
                        <h4><i class="fas fa-history"></i> Recent Activity</h4>
                        <div class="timeline mt-3">
                            ${latestUser.activity?.slice().reverse().map(activity => `
                                <div class="timeline-item">
                                    <div class="time">${new Date(activity.timestamp).toLocaleString()}</div>
                                    <div class="action">${escapeHtml(activity.action)}</div>
                                </div>
                            `).join('') || '<p class="text-muted">No activity yet</p>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDashboardPage() {
    const totalUsers = users.length;
    const latestUser = users.length > 0 ? users[users.length - 1] : null;
    
    return `
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <h2 id="totalUsersStat">${totalUsers}</h2>
                    <p class="text-muted">Total Users</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="stat-card">
                    <i class="fas fa-user-plus"></i>
                    <h2 id="latestUserStat">${latestUser ? latestUser.username : 'None'}</h2>
                    <p class="text-muted">Latest User</p>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="stat-card">
                    <i class="fas fa-clock"></i>
                    <h2 id="lastUpdatedStat">${latestUser ? new Date(latestUser.registeredAt).toLocaleDateString() : 'No data'}</h2>
                    <p class="text-muted">Last Updated</p>
                </div>
            </div>
            
            <div class="col-12 mb-4">
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search users by name, email, or phone...">
                </div>
            </div>
            
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h4><i class="fas fa-list"></i> Registered Users</h4>
                    </div>
                    <div class="card-body">
                        <div id="usersList">
                            ${renderUsersList(users)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderUsersList(usersToRender) {
    if (usersToRender.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <p>No users registered yet</p>
                <button class="btn btn-primary" onclick="renderPage('home')">Register First User</button>
            </div>
        `;
    }
    
    return usersToRender.map(user => `
        <div class="user-card" data-user-id="${user.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h5 class="mb-1"><i class="fas fa-user-circle text-primary"></i> ${escapeHtml(user.username)}</h5>
                    <p class="mb-0 small text-muted">
                        <i class="fas fa-envelope"></i> ${escapeHtml(user.email)}<br>
                        <i class="fas fa-phone"></i> ${user.phone}<br>
                        <i class="fas fa-calendar-alt"></i> Age: ${user.age} | ${user.country}
                    </p>
                    <small class="text-muted">Joined: ${new Date(user.registeredAt).toLocaleDateString()}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger delete-user-btn" data-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ========== EVENT ATTACHMENT ==========
function attachHomeEvents() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    
    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const ageInput = document.getElementById('age');
    const termsCheck = document.getElementById('terms');
    
    let usernameTimeout;
    
    // Username availability check with debounce
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            clearTimeout(usernameTimeout);
            const username = this.value.trim();
            const statusSpan = document.getElementById('usernameStatus');
            
            if (username.length < 3) {
                statusSpan.innerHTML = '<span class="text-danger">❌ Min 3 characters</span>';
                this.classList.add('is-invalid');
                return;
            }
            
            usernameTimeout = setTimeout(async () => {
                const result = await checkUsername(username);
                if (result.available) {
                    statusSpan.innerHTML = '<span class="text-success">✓ Available</span>';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    statusSpan.innerHTML = '<span class="text-danger">✗ Username taken</span>';
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                }
            }, 500);
        });
    }
    
    // Phone number formatting and counter
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
            const countSpan = document.getElementById('phoneCount');
            if (countSpan) countSpan.textContent = this.value.length;
            
            if (this.value.length === 10) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
            }
        });
    }
    
    // Password strength meter
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Confirm password validation
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                this.classList.add('is-invalid');
                document.getElementById('confirmError').textContent = 'Passwords do not match';
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
                document.getElementById('confirmError').textContent = '';
            }
        });
    }
    
    // Age validation
    if (ageInput) {
        ageInput.addEventListener('input', function() {
            const age = parseInt(this.value);
            if (age < 18 || age > 100) {
                this.classList.add('is-invalid');
                document.getElementById('ageError').textContent = 'Age must be between 18 and 100';
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
                document.getElementById('ageError').textContent = '';
            }
        });
    }
    
    // Terms validation
    if (termsCheck) {
        termsCheck.addEventListener('change', function() {
            if (this.checked) {
                this.classList.remove('is-invalid');
                document.getElementById('termsError').textContent = '';
            }
        });
    }
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        
        if (!usernameInput.value.trim() || usernameInput.value.trim().length < 3) {
            usernameInput.classList.add('is-invalid');
            isValid = false;
        }
        
        const email = document.getElementById('email').value.trim();
        if (!email || !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) {
            document.getElementById('email').classList.add('is-invalid');
            document.getElementById('emailError').textContent = 'Valid email is required';
            isValid = false;
        } else {
            document.getElementById('email').classList.remove('is-invalid');
        }
        
        if (!phoneInput.value || phoneInput.value.length !== 10) {
            phoneInput.classList.add('is-invalid');
            document.getElementById('phoneError').textContent = 'Phone must be exactly 10 digits';
            isValid = false;
        }
        
        if (!passwordInput.value || passwordInput.value.length < 8) {
            passwordInput.classList.add('is-invalid');
            isValid = false;
        }
        
        if (passwordInput.value !== confirmInput.value) {
            confirmInput.classList.add('is-invalid');
            document.getElementById('confirmError').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        const age = parseInt(ageInput.value);
        if (!ageInput.value || age < 18 || age > 100) {
            ageInput.classList.add('is-invalid');
            document.getElementById('ageError').textContent = 'Age must be between 18 and 100';
            isValid = false;
        }
        
        if (!termsCheck.checked) {
            termsCheck.classList.add('is-invalid');
            document.getElementById('termsError').textContent = 'You must accept terms';
            isValid = false;
        }
        
        if (!isValid) {
            showToast('Please fix all errors before submitting', 'error');
            return;
        }
        
        const formData = {
            username: usernameInput.value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value,
            age: ageInput.value,
            country: document.getElementById('country').value,
            terms: termsCheck.checked
        };
        
        const result = await registerUser(formData);
        
        if (result.success) {
            showToast(result.message, 'success');
            form.reset();
            if (document.getElementById('phoneCount')) document.getElementById('phoneCount').textContent = '0';
            document.getElementById('strengthBar').className = 'strength-bar';
            document.getElementById('strengthText').innerHTML = 'Strength: <span>Not entered</span>';
            await fetchUsers();
            renderPage('dashboard');
        } else {
            showToast(result.errors?.join(', ') || 'Registration failed', 'error');
        }
    });
}

function attachProfileEvents() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const languageSelect = document.getElementById('languageSelect');
    const notificationToggle = document.getElementById('notificationToggle');
    const latestUser = users[users.length - 1];
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', async function() {
            if (this.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                showToast('Dark Mode (Pink Theme) activated', 'info');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                showToast('Light Mode (Black & Gold) activated', 'info');
            }
            
            if (latestUser) {
                await updatePreferences({ id: latestUser.id, darkMode: this.checked });
            }
        });
    }
    
    if (languageSelect) {
        languageSelect.addEventListener('change', async function() {
            if (latestUser) {
                await updatePreferences({ id: latestUser.id, language: this.value });
                showToast(`Language changed to ${this.options[this.selectedIndex].text}`, 'info');
            }
        });
    }
    
    if (notificationToggle) {
        notificationToggle.addEventListener('change', async function() {
            if (latestUser) {
                await updatePreferences({ id: latestUser.id, notifications: this.checked });
                showToast(`Notifications ${this.checked ? 'enabled' : 'disabled'}`, 'info');
            }
        });
    }
}

function attachDashboardEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filtered = users.filter(user => 
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.phone.includes(searchTerm)
            );
            document.getElementById('usersList').innerHTML = renderUsersList(filtered);
        });
    }
    
    // Delete user buttons
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this user?')) {
                await deleteUser(userId);
                showToast('User deleted successfully', 'success');
                await fetchUsers();
                renderPage('dashboard');
            }
        });
    });
}

// ========== GLOBAL FUNCTIONS ==========
window.startEditProfile = function(userId) {
    document.getElementById('profileView').style.display = 'none';
    document.getElementById('profileEdit').style.display = 'block';
    
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        // Remove existing listener to avoid duplicates
        const newForm = editForm.cloneNode(true);
        editForm.parentNode.replaceChild(newForm, editForm);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(newForm);
            const data = Object.fromEntries(formData.entries());
            
            const result = await updateProfile(data);
            if (result.success) {
                showToast('Profile updated successfully!', 'success');
                await fetchUsers();
                renderPage('profile');
            } else {
                showToast(result.error || 'Update failed', 'error');
            }
        });
    }
};

window.cancelEditProfile = function() {
    renderPage('profile');
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await fetchUsers();
    renderPage('home');
    
    // Theme toggle button
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                renderPage(page);
            }
        });
    });
    
    // Add some console logs for debugging
    console.log('✨ Himstun App Initialized');
    console.log('📋 Users loaded:', users.length);
    console.log('🎨 Theme:', document.documentElement.getAttribute('data-theme'));
});