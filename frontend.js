const fruitsContainer = document.getElementById("fruits");
const cartTableBody = document.querySelector("#cart-table tbody");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkout");
const invoiceContainer = document.getElementById("invoice");
const invoiceTableBody = document.querySelector("#invoice-table tbody");
const invoiceTotalEl = document.getElementById("invoice-total");

let fruits = [];
let cart = [];

// جایگزین کن با URL Backend که Render بهت داده
const BACKEND_URL = "https://friutshop.onrender.com";

// بارگذاری میوه‌ها از Backend
async function loadFruits() {
  const res = await fetch(`${BACKEND_URL}/api/fruits`);
  fruits = await res.json();
  renderFruits();
}

// ایجاد کارت‌های میوه
function renderFruits() {
  fruitsContainer.innerHTML = "";
  fruits.forEach(f => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${f.emoji} ${f.name}</h3>
      <p>قیمت هر کیلو: ${f.price.toLocaleString()} تومان</p>
      <input type="number" min="0.1" step="0.1" value="1" id="kg-${f.id}" style="width:60px;">
      <button onclick="addToCart(${f.id})">افزودن به سبد</button>
    `;
    fruitsContainer.appendChild(card);
  });
}

// افزودن به سبد
function addToCart(id) {
  const fruit = fruits.find(f => f.id === id);
  const kg = parseFloat(document.getElementById(`kg-${id}`).value);
  if (kg <= 0) return alert("وزن معتبر وارد کنید");

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.kg += kg;
  } else {
    cart.push({ id, kg });
  }
  renderCart();
}

// رندر سبد خرید
function renderCart() {
  cartTableBody.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const fruit = fruits.find(f => f.id === item.id);
    const itemTotal = Math.round(item.kg * fruit.price);
    total += itemTotal;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${fruit.name}</td>
      <td><input type="number" min="0.1" step="0.1" value="${item.kg}" onchange="updateKg(${index}, this.value)"></td>
      <td>${fruit.price.toLocaleString()}</td>
      <td>${itemTotal.toLocaleString()}</td>
      <td><button onclick="removeFromCart(${index})">حذف</button></td>
    `;
    cartTableBody.appendChild(tr);
  });
  totalEl.textContent = `جمع کل: ${total.toLocaleString()} تومان`;
}

// حذف آیتم
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// بروزرسانی وزن
function updateKg(index, value) {
  const kg = parseFloat(value);
  if (kg <= 0) return alert("وزن معتبر وارد کنید");
  cart[index].kg = kg;
  renderCart();
}

// ثبت سفارش و پرداخت
async function checkout() {
  if (!cart.length) return alert("سبد خرید خالی است");

  const paymentInfo = { cardNumber: "1234-5678-9012-3456" };

  const res = await fetch(`${BACKEND_URL}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart, paymentInfo })
  });
  const data = await res.json();

  if (data.invoice) {
    invoiceTableBody.innerHTML = "";
    data.invoice.items.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.kg}</td>
        <td>${item.price.toLocaleString()}</td>
        <td>${item.priceTotal.toLocaleString()}</td>
      `;
      invoiceTableBody.appendChild(tr);
    });
    invoiceTotalEl.textContent = `
جمع کل: ${data.invoice.total.toLocaleString()} تومان | 
وضعیت پرداخت: ${data.invoice.paymentStatus} | 
تاریخ: ${data.invoice.paymentDate} | ساعت: ${data.invoice.paymentTime}
    `;
    invoiceContainer.style.display = "block";
    alert("پرداخت موفقیت‌آمیز انجام شد!");
    cart = [];
    renderCart();
  }
}

checkoutBtn.addEventListener("click", checkout);


loadFruits();


