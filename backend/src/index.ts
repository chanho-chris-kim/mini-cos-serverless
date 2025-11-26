import express from "express";
import cors from "cors";
import apiRouter from "./api";

const app = express();

app.use(cors());
app.use(express.json());

// Keep your current prefix (frontend expects /api/*)
app.use("/api", apiRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;

// Only listen locally. Lambda won't hit this block.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mini-COS backend listening on port ${PORT}`);
  });
}

export default app;
