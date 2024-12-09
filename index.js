import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io"; 
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import fabricRouter from "./routes/fabric.route.js";
import messageRouter from "./routes/message.route.js";
import conversationRouter from "./routes/conversation.route.js"
import circlePostRouter from "./routes/circlePost.route.js"
import circleRouter from "./routes/circle.route.js";
import commentRouter from "./routes/comment.route.js";
import commentReplyRouter from "./routes/commentReply.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("connected to MongoDB!!!");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    // origin: [
    //   "http://localhost:8081", // Your frontend URL
    //   "http://192.168.0.155:8081", // Example IP address of a mobile app
    // ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Include other methods if necessary
    credentials: true, // Allow credentials if needed
  })
);

const server = http.createServer(app);


// Setup Socket.IO with the HTTP server
// const io = new Server(server); // <-- without cors

const io = new Server(server, {
  // cors: {
  //   origin: ["http://localhost:8081", "http://192.168.2.16:3000"],
  //   methods: ["GET", "POST"],
  //   credentials: true,
  // },
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// with cors:
// const allowedOrigins = [
// 	"http://localhost:8081", // Your web app running on localhost
// 	"http://192.168.2.16:3000", // Example IP address of a mobile app
// ];
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins, 
//     methods: ["GET", "POST"]
//   }
// });

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for message send events from clients
  socket.on("sendMessage", (message) => {
    // Broadcast the message to all connected clients
    io.emit("receiveMessage", message);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Use routers
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/fabric", fabricRouter);
app.use('/api/message', messageRouter);
app.use('/api/conversation', conversationRouter);
app.use("/api/circles", circleRouter);
app.use('/api/circle-posts', circlePostRouter);
app.use("/api/comments", commentRouter);
app.use("/api/comment-replies", commentReplyRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

server.listen(3000, () => {
  console.log("Service running on port 3000!!!");
});

export { io }; 
