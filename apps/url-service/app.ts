import express from "express";
import url from "./src/routes/url";

const app = express();

app.use(express.json());
app.use("/url", url);


export default app;
