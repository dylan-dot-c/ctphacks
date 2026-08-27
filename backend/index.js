require("dotenv").config();

const express = require("express");
const cors = require("cors");
const analysisRoutes = require("./routes/analysis");

const app = express();
const PORT = process.env.PORT || 3001;

// Vercel forwards the original client IP through one trusted proxy.
app.set("trust proxy", 1);
app.use(cors());
// Bounded to comfortably fit a base64-encoded image plus JSON overhead
app.use(express.json({ limit: "10mb" }));

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Example API route
app.get("/api/hello", (req, res) => {
  const name = req.query.name || "world";
  res.json({ message: `Hello, ${name}!` });
});

app.use("/api", analysisRoutes);

// Never leak internal error details (e.g. raw DB errors) to clients
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(400).json({
      error: "invalid_request",
      message: "Request body is too large.",
    });
  }

  console.error("Unhandled error:", err.message);
  return res.status(500).json({
    error: "internal_error",
    message: "Something went wrong.",
  });
});

// Vercel imports this file as a serverless function, so only listen when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
