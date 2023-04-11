// const io = require("socket.io")(8900, {
//     cors: {
//       origin: "http://localhost:3000",
//     },
// });

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);






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

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });
  
    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            conversationId,
            senderId,
            text,
      });
    });
  
    //when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
})


server.listen(8900,()=>{
  console.log("Server Connected")
})