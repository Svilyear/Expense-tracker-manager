document.addEventListener('DOMContentLoaded', async () => {
    const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');
    let expenseChart;

    const fetchExpenses = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/expenses');
            const expenses = await response.json();
            return expenses;
        } catch (err) {
            console.error('Error fetching expenses:', err);
            return [];
        }
    };

    const getTopExpenses = (expenses) => {
        const sortedExpenses = expenses.sort((a, b) => b.amount - a.amount);
        return sortedExpenses.slice(0, 5);
    };

    const updateChart = (expenses) => {
        const topExpenses = getTopExpenses(expenses);
        const labels = topExpenses.map(expense => expense.name);
        const data = topExpenses.map(expense => expense.amount);

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(expenseChartCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'gold',
                        'lightcoral',
                        'lightskyblue',
                        'green',
                        'red'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'left',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw;
                                return label;
                            }
                        }
                    }
                }
            }
        });
    };

    const expenses = await fetchExpenses();
    updateChart(expenses);
});