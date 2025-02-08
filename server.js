import { app } from "./app.js";
import { config } from "dotenv";
import { connectDatabase } from "./config/database.js";
import express from 'express';

config({
  path: "./config/config.env",
});

connectDatabase();

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log("Server is running on port " + process.env.PORT);
});