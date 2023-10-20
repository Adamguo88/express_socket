const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const server = http.Server(app).listen(8080, () => {
  console.log("server start 8080");
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // 允許的前端來源
    methods: ["GET", "POST"], // 允許的請求方法
    credential: true,
    allowEI03: true,
  },
});

const users = {};

io.on("connection", (socket) => {
  const socketID = socket.id;
  const ID = socket.handshake.query;
  console.log(`${socketID} - 連線`);

  const { modifyCode, onlyCode } = JSON.parse(ID.user);
  if (!!modifyCode && !!onlyCode) {
    if (users[modifyCode]) {
      const getCode = users[modifyCode];
      if (getCode !== onlyCode) {
        io.to(modifyCode).emit("repeatLogin", "即將被登出");
        const getRoom = io.sockets.adapter.rooms.get(modifyCode);

        if (!!getRoom) {
          socket.leave(modifyCode);
          for (const room of getRoom) {
            io.in(room).socketsLeave(modifyCode);
            io.in(room).disconnectSockets();
            console.log("關閉房間，並且主動切斷連線");
          }
        }
        delete users[modifyCode];
        users[modifyCode] = onlyCode;
        socket.join(modifyCode);
      } else {
        socket.join(modifyCode);
      }
    } else {
      users[modifyCode] = onlyCode;
      socket.join(modifyCode);
    }
  }

  socket.on("checkRoom", () => {
    const count = io.engine.clientsCount; // 獲取連線數量
    console.log(count);
  });

  socket.on("customEvent", (data) => {
    io.to("adam").emit("adam", data);
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "斷開連線");
  });
});
