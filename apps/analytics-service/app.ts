import express from "express";
import analyticsRoutes from "./src/routes/analytics";

const app = express();

app.use(express.json());
app.use("/analytics", analyticsRoutes);

export default app;
