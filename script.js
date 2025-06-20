const darkToggle = document.getElementById("darkModeToggle");
const incomeForm = document.getElementById("income-form");
const expenseForm = document.getElementById("expense-form");
const incomeList = document.getElementById("income-list");
const expenseList = document.getElementById("expense-list");
const transactionLog = document.getElementById("transaction-log");

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const netBalanceEl = document.getElementById("net-balance");

let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Toggle Dark Mode
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Handle “Other” category logic
document.querySelectorAll(".category").forEach((select) => {
  select.addEventListener("change", function () {
    const customInput = this.nextElementSibling;
    if (this.value === "Other") {
      customInput.style.display = "inline-block";
      customInput.focus();
    } else {
      customInput.style.display = "none";
    }
  });
});

// Add Income
incomeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(incomeForm[0].value);
  const description = incomeForm[1].value;
  const categorySelect = incomeForm[2];
  const customCategoryInput = incomeForm[3];
  const category =
    categorySelect.value === "Other"
      ? customCategoryInput.value
      : categorySelect.value;

  if (!amount || !description || !category) return;

  incomes.push({
    id: Date.now(),
    amount,
    description,
    category,
    date: new Date(),
  });

  incomeForm.reset();
  saveAndUpdate();
});

// Add Expense
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(expenseForm[0].value);
  const description = expenseForm[1].value;
  const categorySelect = expenseForm[2];
  const customCategoryInput = expenseForm[3];
  const category =
    categorySelect.value === "Other"
      ? customCategoryInput.value
      : categorySelect.value;

  if (!amount || !description || !category) return;

  expenses.push({
    id: Date.now(),
    amount,
    description,
    category,
    date: new Date(),
  });

  expenseForm.reset();
  saveAndUpdate();
});

// Save to localStorage
function saveAndUpdate() {
  localStorage.setItem("incomes", JSON.stringify(incomes));
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
}

// Delete Item
function deleteItem(id, type) {
  if (type === "income") {
    incomes = incomes.filter((i) => i.id !== id);
  } else {
    expenses = expenses.filter((e) => e.id !== id);
  }
  saveAndUpdate();
}

// Update UI
function updateUI() {
  renderList(incomeList, incomes, "income");
  renderList(expenseList, expenses, "expense");

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = totalIncome - totalExpense;

  totalIncomeEl.textContent = totalIncome.toFixed(2);
  totalExpenseEl.textContent = totalExpense.toFixed(2);
  netBalanceEl.textContent = net.toFixed(2);

  renderTransactions();
  updateChart();
}

// Render income/expense list
function renderList(listEl, items, type) {
  listEl.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.description} - $${item.amount} [${item.category}]
      <button onclick="deleteItem(${item.id}, '${type}')">DELETE</button>
    `;
    listEl.appendChild(li);
  });
}

// Render transaction log
function renderTransactions() {
  const all = [
    ...incomes.map((i) => ({ ...i, type: "income" })),
    ...expenses.map((e) => ({ ...e, type: "expense" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  transactionLog.innerHTML = "";
  all.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.type === "income" ? "+" : "-"} $${
      item.amount
    }</strong> • ${item.description} • ${item.category}`;
    li.style.color = item.type === "income" ? "green" : "red";
    transactionLog.appendChild(li);
  });
}

// Chart setup
const ctx = document.getElementById("categoryChart").getContext("2d");
let pieChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [],
    datasets: [
      {
        label: "Spending by Category",
        data: [],
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffcd56",
          "#4bc0c0",
          "#9966ff",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  },
});

function updateChart() {
  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;
  });

  pieChart.data.labels = Object.keys(categoryTotals);
  pieChart.data.datasets[0].data = Object.values(categoryTotals);
  pieChart.update();
}

// Initial render
updateUI();
