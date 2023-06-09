// const io = require("socket.io")(8900, {
//     cors: {
//       origin: "http://localhost:3000",
//     },
// });

const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const cors = require("cors")

const app = express();
app.use(cors({
    origin: 'https://localhost:3000', 
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true 
}))
const server = http.createServer(app);
const io = socketIO(server);

app.get("/",(req,res)=>{
  res.send("Hello Server")
})




let users = [];
const addUser = (userId, socketId) => {
    if(userId){
        !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
    }

};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};



io.on("connection", (socket)=>{
    console.log("a user connected.");

 
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });
  

    socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            conversationId,
            senderId,
            text,
      });
    });
  
  
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
})


server.listen(8900,()=>{
  console.log("Server Connected")
})