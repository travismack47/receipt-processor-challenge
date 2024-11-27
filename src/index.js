const express = require("express");
const { v4: uuidv4 } = require("uuid");
const calculatePoints = require("./points.js");
const { saveReceipt, getReceiptPoints } = require("./storage.js");
const receiptSchema = require("./schema.js");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(express.json());
app.use(morgan("combined"));
app.use(helmet());

const PORT = process.env.PORT || 3000;

const maxGlobalRequests = 100;
const maxReceiptRequests = 100;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxGlobalRequests,
  message: { error: "Too many requests, please try again later." },
});

app.use(globalLimiter);

const receiptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxReceiptRequests,
  message: {
    error: "Too many requests to /receipts/process, please try again later.",
  },
});

app.post("/receipts/process", receiptLimiter, async (req, res, next) => {
  try {
    const { error, value: receipt } = receiptSchema.validate(req.body);

    if (error) {
      const validationError = new Error(
        `Invalid receipt data: ${error.details[0].message}`
      );
      validationError.status = 400;
      throw validationError;
    }

    const id = uuidv4();
    const points = calculatePoints(receipt);

    saveReceipt(id, points);

    res.status(200).json({ id });
  } catch (error) {
    next(error);
  }
});

app.get("/receipts/:id/points", receiptLimiter, async (req, res, next) => {
  try {
    const id = req.params.id;
    const points = getReceiptPoints(id);

    if (points === null) {
      const error = new Error("Receipt not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({ points });
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Resource not found" });
});

app.use((err, req, res, next) => {
  console.error(`Error occurred during request to ${req.path}`);
  console.error(err.stack);

  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log("Server running on PORT", PORT);
});

module.exports = app;
