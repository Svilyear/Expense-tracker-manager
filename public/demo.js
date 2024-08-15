// Get form, expense list, and total amount elements
const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmountElement = document.getElementById("total-amount");

// Initialize expenses array from localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Track the index of the expense being edited
let editIndex = -1;

// Function to render expenses in tabular form
function renderExpenses() {
    
    // Clear expense list
    expenseList.innerHTML = "";

    // Initialize total amount
    let totalAmount = 0;

    // Loop through expenses array and create table rows
    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const expenseRow = document.createElement("tr");
        expenseRow.innerHTML = `
        <td>${expense.date}</td>
        <td>${expense.name}</td>
        <td>KSH${expense.amount.toFixed(2)}</td>
        <td class="delete-btn" data-id="${i}">Delete</td>
        <td class="edit-btn" data-id="${i}">Edit</td>`;

        expenseList.appendChild(expenseRow);

        // Update total amount
        totalAmount += expense.amount;
    }

    // Update total amount display
    totalAmountElement.textContent = totalAmount.toFixed(2);

    // Save expenses to localStorage
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Function to add or update expense
function addOrUpdateExpense(event) {
    event.preventDefault();

    // Get expense date, name and amount from form
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

    // Clear form inputs
    expenseNameInput.value = "";
    expenseAmountInput.value = "";
    expenseDateInput.value = "";

    // Create new expense object
    const expense = {
        date: expenseDate,
        name: expenseName,
        amount: expenseAmount,
    };

    if (editIndex >= 0) {
        // Update existing expense
        expenses[editIndex] = expense;
        editIndex = -1; // Reset edit index
    } else {
        // Add new expense
        expenses.push(expense);
    }

    // Render expenses
    renderExpenses();
}

// Function to delete expense
function deleteExpense(event) {
    if (event.target.classList.contains("delete-btn")) {
        // Get expense index from data-id attribute
        const expenseIndex = parseInt(event.target.getAttribute("data-id"));

        // Confirm deletion
        if (confirm("CONFIRM DELETE ?")) {
            // Remove expense from expenses array
            expenses.splice(expenseIndex, 1);

            // Render expenses
            renderExpenses();
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

// Render initial expenses on page load
renderExpenses();
