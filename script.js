const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

let editId = null; // To track the ID of the transaction being edited

form.addEventListener("submit", addOrEditTransaction);

// Update totals and display them
function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  balance.textContent = formatter.format(balanceTotal);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

// Render transaction list on the page
function renderList() {
  list.innerHTML = "";

  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  } else {
    status.textContent = ""; // Clear any status message if transactions exist
  }

  transactions.forEach(({ id, description, amount, date, type }) => {
    const sign = type === "income" ? 1 : -1;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="name">
        <h4>${description}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <button onclick="editTransaction(${id})">Edit</button>
        <button onclick="deleteTransaction(${id})">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });
}

renderList();
updateTotal();

// Delete transaction by ID
function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  if (index !== -1) transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

// Populate form fields to edit a transaction
function editTransaction(id) {
  const transaction = transactions.find((trx) => trx.id === id);
  if (!transaction) return;

  // Populate form with existing transaction data
  form.elements["description"].value = transaction.description;
  form.elements["amount"].value = transaction.amount;
  form.elements["date"].value = transaction.date.split("T")[0];
  form.elements["type"].checked = transaction.type === "income";
  
  editId = id; // Set editId to know which transaction to update
}

// Add a new transaction or update an existing one
function addOrEditTransaction(e) {
  e.preventDefault();

  const formData = new FormData(form);

  const newTransaction = {
    id: editId || Date.now(), // Generate unique ID using Date if adding a new transaction
    description: formData.get("description"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")).toISOString(),
    type: form.elements["type"].checked ? "income" : "expense",
  };

  if (editId) {
    // Update an existing transaction
    const index = transactions.findIndex((trx) => trx.id === editId);
    transactions[index] = newTransaction;
    editId = null; // Reset editId after updating
  } else {
    // Add a new transaction
    transactions.push(newTransaction);
  }

  form.reset(); // Clear form fields

  updateTotal();
  saveTransactions();
  renderList();
}

// Save transactions to localStorage
function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}
