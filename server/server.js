const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ScanWise backend is running",
  });
});

app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`ScanWise server running on http://localhost:${PORT}`);
});