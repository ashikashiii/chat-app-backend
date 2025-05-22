import expess from "express";
// import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";




// create express app and http server
const app = expess();
const server = http.createServer(app);

//initialize socket.io server
export const io = new Server(server,{
    cors: {origin:"*"}
})

//store online users
export const userSocketMap = {}; // {userId: socketId}

//socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id; 
    
//emit online user to all connected clients
io.emit("getOnlineUsers", Object.keys(userSocketMap));

socket.on("disconnect",()=>{
    console.log("user Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
})

})

// Middleware setup
app.use(cors());
app.use(expess.json({ limit: "4mb" }));


//Route setup
app.use( "/api/status", (req, res) => res.send("server is live"));
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter);

// connect to mongoDB
await connectDB();


if (process.env.NODE_ENV !== "production"){
const PORT = process.env.PORT || 5000; 
server.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
}

//export server for vercel
export default server;