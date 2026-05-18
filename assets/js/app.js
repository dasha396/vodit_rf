function apiCall(url, method, data) {
    return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
    }).then(res => res.json());
}

function showMessage(elementId, message, isError = true) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<div class="alert alert-${isError ? 'danger' : 'success'}">${message}</div>`;
        setTimeout(() => el.innerHTML = '', 3000);
    }
}

function checkAuth() {
    return apiCall('../api/check-auth.php', 'GET')
        .then(data => {
            if (data.authenticated) {
                window.currentUser = data.user;
            } else {
                window.currentUser = null;
            }
            return window.currentUser;
        });
}

function updateMenu() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    if (window.currentUser) {
        let menuHtml = `
            <li class="nav-item"><a class="nav-link" href="index.html">Главная</a></li>
            <li class="nav-item"><a class="nav-link" href="dashboard.html">Кабинет</a></li>
        `;
        if (window.currentUser.role === 'admin') {
            menuHtml += `<li class="nav-item"><a class="nav-link" href="admin.html">Админка</a></li>`;
        }
        menuHtml += `<li class="nav-item"><a class="nav-link" href="#" id="logoutNavBtn">Выход</a></li>`;
        navMenu.innerHTML = menuHtml;
        
        document.getElementById('logoutNavBtn')?.addEventListener('click', logout);
    } else {
        navMenu.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="index.html">Главная</a></li>
            <li class="nav-item"><a class="nav-link" href="login.html">Вход</a></li>
            <li class="nav-item"><a class="nav-link" href="register.html">Регистрация</a></li>
        `;
    }
}

function updateHomePage() {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;
    
    if (window.currentUser) {
        authButtons.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary btn-lg">Личный кабинет</a>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="register.html" class="btn btn-success btn-lg me-2">Регистрация</a>
            <a href="login.html" class="btn btn-primary btn-lg">Вход</a>
        `;
    }
}

function logout() {
    apiCall('../api/logout.php', 'POST')
        .then(() => {
            window.location.href = 'index.html';
        });
}

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        apiCall('../api/register.php', 'POST', data)
            .then(res => {
                if (res.success) {
                    showMessage('message', 'Регистрация успешна! Перенаправление...', false);
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    showMessage('message', res.errors.join('<br>'), true);
                }
            });
    });
}

if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        apiCall('../api/login.php', 'POST', data)
            .then(res => {
                if (res.success) {
                    showMessage('message', 'Вход выполнен! Перенаправление...', false);
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    showMessage('message', res.error, true);
                }
            });
    });
}

function loadApplications() {
    const container = document.getElementById('applicationsList');
    if (!container) return;
    
    apiCall('../api/get-applications.php', 'GET')
        .then(data => {
            if (data.error) {
                container.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                return;
            }
            
            if (data.length === 0) {
                container.innerHTML = `<div class="alert alert-info">У вас пока нет заявок. <a href="add-application.html">Создать заявку</a></div>`;
                return;
            }
            
            let html = `
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="table-primary">
                            <tr><th>Транспорт</th><th>Дата</th><th>Оплата</th><th>Статус</th><th>Дата создания</th></tr>
                        </thead>
                        <tbody>
            `;
            
            data.forEach(app => {
                let statusClass = '';
                if (app.status === 'Новая') statusClass = 'status-new';
                else if (app.status === 'В работе') statusClass = 'status-working';
                else statusClass = 'status-completed';
                
                html += `
                    <tr>
                        <td data-label="Транспорт">${app.service_name}</td>
                        <td data-label="Дата">${app.start_date}</td>
                        <td data-label="Оплата">${app.payment_label}</td>
                        <td data-label="Статус"><span class="status-badge ${statusClass}">${app.status}</span></td>
                        <td data-label="Дата создания">${new Date(app.created_at).toLocaleDateString()}</td>
                    </tr>
                `;
            });
            
            html += `</tbody></table></div>`;
            container.innerHTML = html;
            
            const userSpan = document.getElementById('userLogin');
            if (userSpan && window.currentUser) {
                userSpan.innerText = window.currentUser.login;
            }
        });
}

if (document.getElementById('applicationForm')) {
    document.getElementById('applicationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        apiCall('../api/add-application.php', 'POST', data)
            .then(res => {
                if (res.success) {
                    showMessage('message', 'Заявка отправлена! Перенаправление...', false);
                    setTimeout(() => window.location.href = 'dashboard.html', 1500);
                } else {
                    showMessage('message', res.error || 'Ошибка', true);
                }
            });
    });
}

function loadAdminData() {

    apiCall('../api/get-stats.php', 'GET')
        .then(stats => {
            if (stats.error) return;
            document.getElementById('totalCount').innerText = stats.total || 0;
            document.getElementById('newCount').innerText = stats.new_count || 0;
            document.getElementById('workingCount').innerText = stats.working_count || 0;
            document.getElementById('completedCount').innerText = stats.completed_count || 0;
        });
    
    apiCall('../api/get-all-applications.php', 'GET')
        .then(data => {
            const container = document.getElementById('allApplications');
            if (data.error) {
                container.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
                return;
            }
            
            let html = `
                <div class="table-responsive">
                    <table class="table table-striped table-bordered">
                        <thead class="table-dark">
                            <tr><th>ID</th><th>Пользователь</th><th>ФИО</th><th>Транспорт</th><th>Дата</th><th>Оплата</th><th>Статус</th><th>Действие</th></tr>
                        </thead>
                        <tbody>
            `;
            
            data.forEach(app => {
                let statusClass = '';
                if (app.status === 'Новая') statusClass = 'status-new';
                else if (app.status === 'В работе') statusClass = 'status-working';
                else statusClass = 'status-completed';
                
                html += `
                    <tr>
                        <td>${app.id}</td>
                        <td>${app.login}</td>
                        <td>${app.full_name}</td>
                        <td>${app.service_name}</td>
                        <td>${app.start_date}</td>
                        <td>${app.payment_label}</td>
                        <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                        <td>
                            <select class="form-select form-select-sm status-select" data-id="${app.id}">
                                <option value="Новая" ${app.status === 'Новая' ? 'selected' : ''}>Новая</option>
                                <option value="В работе" ${app.status === 'В работе' ? 'selected' : ''}>В работе</option>
                                <option value="Завершено" ${app.status === 'Завершено' ? 'selected' : ''}>Завершено</option>
                            </select>
                        </td>
                    </tr>
                `;
            });
            
            html += `</tbody></table></div>`;
            container.innerHTML = html;
            
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    const appId = e.target.dataset.id;
                    const newStatus = e.target.value;
                    
                    apiCall('../api/update-status.php', 'POST', {
                        application_id: appId,
                        new_status: newStatus
                    }).then(res => {
                        if (res.success) {
                            loadAdminData();
                        } else {
                            alert(res.error || 'Ошибка');
                        }
                    });
                });
            });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth().then(() => {
        updateMenu();
        updateHomePage();
        
        const userSpan = document.getElementById('userLogin');
        if (userSpan && window.currentUser) {
            userSpan.innerText = window.currentUser.login;
        }
        
        const adminLoginSpan = document.getElementById('adminLogin');
        if (adminLoginSpan && window.currentUser && window.currentUser.role === 'admin') {
            adminLoginSpan.innerText = `Админ: ${window.currentUser.login}`;
        }
        
        if (document.getElementById('applicationsList')) {
            loadApplications();
        }

        if (document.getElementById('allApplications')) {
            loadAdminData();
        }

        document.querySelectorAll('#logoutBtn, #logoutBtn2, #logoutNavBtn').forEach(btn => {
            if (btn) btn.addEventListener('click', logout);
        });
    });
});