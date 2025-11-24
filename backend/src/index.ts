import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import apiRouter from "./api";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", apiRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mini-COS backend listening on port ${PORT}`);
  });
}

export default app;
