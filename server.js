const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const fruitsFile = "fruits.json";

function getFruits() {
  return JSON.parse(fs.readFileSync(fruitsFile, "utf8"));
}

app.get("/api/fruits", (req, res) => res.json(getFruits()));

app.get("/api/fruits/:id", (req, res) => {
  const fruit = getFruits().find(f => f.id === +req.params.id);
  if (!fruit) return res.status(404).json({ error: "میوه یافت نشد" });
  res.json(fruit);
});

app.post("/api/order", (req, res) => {
  const cart = req.body.cart;
  if (!cart || !cart.length) return res.status(400).json({ error: "سبد خرید خالی است" });

  let total = 0;
  const detailedItems = cart.map(item => {
    const fruit = getFruits().find(f => f.id === item.id);
    const priceTotal = Math.round(item.kg * fruit.price);
    total += priceTotal;
    return { ...fruit, kg: item.kg, priceTotal };
  });

  const now = new Date();
  const invoice = {
    items: detailedItems,
    total,
    paymentStatus: "پرداخت شد",
    paymentDate: now.toLocaleDateString("fa-IR"),
    paymentTime: now.toLocaleTimeString("fa-IR")
  };

  res.json({ message: "پرداخت موفقیت‌آمیز انجام شد", invoice });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));