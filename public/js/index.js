document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalAmountSpan = document.getElementById('total-amount');
    const profileForm = document.getElementById('profile-form');
    const profilePictureInput = document.getElementById('profile-picture');
    const profilePicturePreview = document.getElementById('profile-picture-preview');
    const loginLink = document.getElementById('login-link');
    const registrationLink = document.getElementById('registration-link');
    const logoutBtn = document.getElementById('logout-btn');

    // Initialize expenses array from server data
    let expenses = [];
    let editIndex = -1;

    // Fetch all expenses and update the list and total
    const fetchExpenses = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/expenses');
            expenses = await response.json();
            updateExpenseList(expenses);
            updateTotalAmount();
        } catch (err) {
            console.error('Error fetching expenses:', err);
        }
    };

    // Update the expense list
    const updateExpenseList = (expenses) => {
        expenseList.innerHTML = ''; // Clear existing list
        expenses.forEach((expense, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.name}</td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>
                    <button class="edit-button" data-id="${index}">Edit</button>
                    <button class="delete-button" data-id="${index}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    };

    // Update the total amount
    const updateTotalAmount = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/expenses/total');
            const totalAmount = await response.json();
            totalAmountSpan.textContent = totalAmount.toFixed(2);
        } catch (err) {
            console.error('Error fetching total amount:', err);
        }
    };

    // Add a new expense or update an existing one
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('date').value;
        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);

        // Validate inputs
        if (!date || name === "" || isNaN(amount)) {
            alert("Please enter valid expense details.");
            return;
        }

        const expense = { date, name, amount };

        try {
            if (editIndex >= 0) {
                // Update existing expense on the server
                const response = await fetch(`http://localhost:3000/api/expenses/${expenses[editIndex].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(expense),
                });
                const updatedExpense = await response.json();
                expenses[editIndex] = updatedExpense;
                editIndex = -1; // Reset edit index
                alert("Expense updated successfully!");
            } else {
                // Add new expense to the server
                const response = await fetch('http://localhost:3000/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(expense),
                });
                const newExpense = await response.json();
                expenses.push(newExpense);
                alert("Expense added successfully!");
            }
            fetchExpenses(); // Refresh the list and total
        } catch (err) {
            console.error('Error adding/updating expense:', err);
        }

        // Clear form inputs
        document.getElementById('date').value = "";
        document.getElementById('expense-name').value = "";
        document.getElementById('expense-amount').value = "";
    });

    // Event delegation for edit and delete buttons
    expenseList.addEventListener('click', async (e) => {
        const index = e.target.dataset.id;
        if (e.target.classList.contains('edit-button')) {
            // Populate form with existing expense details for editing
            editIndex = index;
            const expense = expenses[editIndex];
            document.getElementById('date').value = expense.date;
            document.getElementById('expense-name').value = expense.name;
            document.getElementById('expense-amount').value = expense.amount;
            window.scrollTo(0, 0); // Scroll to the top for user convenience
        } else if (e.target.classList.contains('delete-button')) {
            // Delete expense
            try {
                await fetch(`http://localhost:3000/api/expenses/${expenses[index].id}`, {
                    method: 'DELETE',
                });
                fetchExpenses(); // Refresh the list
                alert('Expense deleted successfully!');
            } catch (err) {
                console.error('Error deleting expense:', err);
            }
        }
    });

    // Handle profile picture upload
    profilePictureInput.addEventListener('change', () => {
        const file = profilePictureInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicturePreview.src = e.target.result;
                profilePicturePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(profileForm);

        try {
            const response = await fetch('http://localhost:3000/api/upload-profile-picture', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Profile picture uploaded successfully!');
            } else {
                alert('Failed to upload profile picture');
            }
        } catch (err) {
            console.error('Error uploading profile picture:', err);
        }
    });

    // Handle login and logout functionality
    const checkLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            if (loginLink) {
                loginLink.style.display = 'none'; // Hide login link
            }
            if (registrationLink) {
                registrationLink.style.display = 'none'; // Hide registration link
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'inline'; // Show logout button
            }
            fetchExpenses(); // Fetch expenses if logged in
        } else {
            if (loginLink) {
                loginLink.style.display = 'inline'; // Show login link
            }
            if (registrationLink) {
                registrationLink.style.display = 'inline'; // Show registration link
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none'; // Hide logout button
            }
        }
    };

    logoutBtn.addEventListener('click', () => {
        // Remove login status from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        // Redirect to the login page
        window.location.href = 'login.html';
    });

    // Initial check of login status
    checkLoginStatus();
});
