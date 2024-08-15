// logout.js

document.getElementById('logout-btn').addEventListener('click', function () {
    // Clear session data or tokens
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});
