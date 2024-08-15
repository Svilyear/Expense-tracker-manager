document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalAmountSpan = document.getElementById('total-amount');
  
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!isLoggedIn) {
      // Redirect to the login page if not logged in
      window.location.href = 'login.html';
    } else {
      // Greet the user and display the profile picture
      const greetingMessage = document.getElementById('greeting-message');
      const profilePictureDisplay = document.getElementById('profile-picture-display');
      
      if (user) {
        greetingMessage.textContent = `Welcome, ${user.username}!`;
        greetingMessage.style.display = 'block';
        if (user.profilePicture) {
          profilePictureDisplay.src = user.profilePicture;
          profilePictureDisplay.style.display = 'block';
        }
      }
    }
  
    let expenses = [];
    let editIndex = -1;
  
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
  
    const updateExpenseList = (expenses) => {
      expenseList.innerHTML = '';
      expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.name}</td>
          <td>${expense.amount}</td>
          <td>
            <button class="edit-button" data-id="${expense.id}">Edit</button>
            <button class="delete-button" data-id="${expense.id}">Delete</button>
          </td>
        `;
        expenseList.appendChild(row); 
      });
    };
  
    const updateTotalAmount = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/expenses/total');
        const totalAmount = await response.json();
        if (totalAmountSpan) {
          totalAmountSpan.textContent = totalAmount.toFixed(2);
        }
      } catch (err) {
        console.error('Error fetching total amount:', err);
      }
    };
  
    const addOrUpdateExpense = async (e) => {
      e.preventDefault();
      const date = document.getElementById('date').value;
      const name = document.getElementById('expense-name').value;
      const amount = parseFloat(document.getElementById('expense-amount').value);
  
      if (!date || name === "" || isNaN(amount)) {
        alert("Please enter valid expense details.");
        return;
      }
  
      const expense = { date, name, amount };
  
      try {
        if (editIndex >= 0) {
          const response = await fetch(`http://localhost:3000/api/expenses/${expenses[editIndex].id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
          });
          const updatedExpense = await response.json();
          expenses[editIndex] = updatedExpense;
          editIndex = -1;
          alert("Expense updated successfully!");
        } else {
          const response = await fetch('http://localhost:3000/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
          });
          const newExpense = await response.json();
          expenses.push(newExpense);
          alert("Expense added successfully!");
        }
  
        fetchExpenses();
      } catch (err) {
        console.error('Error adding/updating expense:', err);
      }
  
      document.getElementById('date').value = "";
      document.getElementById('expense-name').value = "";
      document.getElementById('expense-amount').value = "";
    };
  
    expenseForm.addEventListener('submit', addOrUpdateExpense);
    
    expenseList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('delete-button')) {
        const id = e.target.getAttribute('data-id');
        try {
          await fetch(`http://localhost:3000/api/expenses/${id}`, { method: 'DELETE' });
          alert('Expense deleted successfully!');
          fetchExpenses();
        } catch (err) {
          console.error('Error deleting expense:', err);
        }
      } else if (e.target.classList.contains('edit-button')) {
        const id = e.target.getAttribute('data-id');
        editIndex = expenses.findIndex(expense => expense.id == id);
        const expense = expenses[editIndex];
        document.getElementById('date').value = expense.date;
        document.getElementById('expense-name').value = expense.name;
        document.getElementById('expense-amount').value = expense.amount;
      }
    });
  
    fetchExpenses();
  });
  