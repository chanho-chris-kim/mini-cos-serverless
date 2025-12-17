import express from "express";
import cors from "cors";
import apiRouter from "./api";
import { runAllSeeds } from "./seed/seed";
import { devBypassAuth } from "./middleware/devBypass.middleware";
console.log("NODE_ENV is:", process.env.NODE_ENV);

const app = express();

app.use(cors());
app.use(express.json());
app.use(devBypassAuth);
runAllSeeds();

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
