import express from "express";
import url from "./src/routes/url";
import folder from "./src/routes/folder";

const app = express();

app.use(express.json());
app.use("/url", url);
app.use("/folder", folder);

export default app;
