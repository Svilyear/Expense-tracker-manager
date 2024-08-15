// Get form, expense list, total amount elements
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmountElement = document.getElementById("total-amount");

// Initialize expenses array from server data
let expenses = [];

// Track the index of the expense being edited
let editIndex = -1;

// Function to fetch expenses from the server
function fetchExpenses() {
    fetch('http://localhost:3000/api/expenses')
        .then(response => response.json())
        .then(data => {
            expenses = data;
            renderExpenses();
        })
        .catch(error => console.error('Error fetching expenses:', error));
}

// Function to render expenses in tabular form
function renderExpenses() {
    // Clear expense list
    expenseList.innerHTML = "";

    // Initialize total amount
    let totalAmount = 0;

    // Loop through expenses array and create table rows
    expenses.forEach((expense, index) => {
        totalAmount += parseFloat(expense.amount);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.name}</td>
            <td>${expense.amount}</td>
            <td>
                <button class="edit-btn" data-id="${index}">Edit</button>
                <button class="delete-btn" data-id="${index}">Delete</button>
            </td>
        `;
        expenseList.appendChild(row);
    });

    // Update total amount display
    totalAmountElement.textContent = totalAmount.toFixed(2);
}

// Function to add or update expense
function addOrUpdateExpense(event) {
    event.preventDefault();

    // Get expense date, name, and amount from form
    const expenseDateInput = document.getElementById('date');
    const expenseNameInput = document.getElementById("expense-name");
    const expenseAmountInput = document.getElementById("expense-amount");

    const expenseDate = expenseDateInput.value;
    const expenseName = expenseNameInput.value;
    const expenseAmount = parseFloat(expenseAmountInput.value);

    // Validate inputs
    if (!expenseDate || expenseName === "" || isNaN(expenseAmount)) {
        alert("Please enter valid expense details.");
        return;
    }

    // Create new expense object
    const expense = {
        date: expenseDate,
        name: expenseName,
        amount: expenseAmount,
    };

    if (editIndex >= 0) {
        // Update existing expense on the server
        fetch(`http://localhost:3000/api/expenses/${expenses[editIndex].id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        })
        .then(response => response.json())
        .then(data => {
            expenses[editIndex] = data;
            editIndex = -1; // Reset edit index
            renderExpenses();
            alert("Expense updated successfully!");
        })
        .catch(error => console.error('Error updating expense:', error));
    } else {
        // Add new expense to the server
        fetch('http://localhost:3000/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        })
        .then(response => response.json())
        .then(data => {
            expenses.push(data);
            renderExpenses();
            alert("Expense added successfully!");
        })
        .catch(error => console.error('Error adding expense:', error));
    }

    // Clear form inputs
    expenseNameInput.value = "";
    expenseAmountInput.value = "";
    expenseDateInput.value = "";
}

// Function to delete expense
function deleteExpense(event) {
    if (event.target.classList.contains("delete-btn")) {
        // Get expense index from data-id attribute
        const expenseIndex = parseInt(event.target.getAttribute("data-id"));

        // Confirm deletion
        if (confirm("Are you sure you want to delete this expense?")) {
            // Delete expense from the server
            fetch(`http://localhost:3000/api/expenses/${expenses[expenseIndex].id}`, {
                method: 'DELETE'
            })
            .then(() => {
                expenses.splice(expenseIndex, 1);
                renderExpenses();
            })
            .catch(error => console.error('Error deleting expense:', error));
        }
    }
}

// Function to edit expense
function editExpense(event) {
    if (event.target.classList.contains("edit-btn")) {
        // Get expense index from data-id attribute
        editIndex = parseInt(event.target.getAttribute("data-id"));
        const expense = expenses[editIndex];

        // Populate form with existing expense details
        document.getElementById('date').value = expense.date;
        document.getElementById("expense-name").value = expense.name;
        document.getElementById("expense-amount").value = expense.amount;

        // Scroll to form for user convenience
        window.scrollTo(0, 0);
    }
}

// Add event listeners
expenseForm.addEventListener("submit", addOrUpdateExpense);
expenseList.addEventListener("click", deleteExpense);
expenseList.addEventListener("click", editExpense);

// Fetch and render initial expenses on page load
fetchExpenses();
