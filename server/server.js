const express = require("express");
const cors = require("cors");
const path = require("path");

const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const clientBuildPath = path.join(__dirname, "..", "client", "dist");

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ScanWise backend is running",
  });
});

app.use("/api/products", productRoutes);

app.use(express.static(clientBuildPath));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`ScanWise server running on port ${PORT}`);
});
