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

let loginList = [];

io.on("connection", (socket) => {
  console.log(`${socket.id} - 連線`);

  // 這段[ socket.handshake.query   ]可以拿到前端傳入的參數
  const ID = socket.handshake.query.userID;
  //
  const findRepeat = loginList.find((item) => item.ID === ID);

  if (findRepeat) {
    io.to(findRepeat.socketID).emit(
      "message",
      `${findRepeat.socketID} - 你即將被強制登出`
    );
    loginList.push({
      ID: ID,
      socketID: socket.id, // 唯一值
    });
    socket.emit("socketID", socket.id);
    // loginList = loginList.find((item) => item.ID !== ID);
  } else {
    // console.log(socket.id);
    // console.log(io.sockets.sockets);
    loginList.push({
      ID: ID,
      socketID: socket.id, // 唯一值
    });
    socket.emit("socketID", socket.id);
  }

  // 在這裡設定其他 WebSocket 事件和處理程序
  socket.on("getMessage", (msg) => {
    console.log(msg);
    setTimeout(() => {
      socket.emit(
        "getMessage",
        "收到客戶端訊息，2秒後，服務器端傳送給客戶端數據"
      );
    }, 2000);
  });

  socket.on("heartbeat", (msg) => {
    console.log(msg);
  });

  socket.on("message", (msg) => {
    const count = io.engine.clientsCount; // 獲取連線數量
    console.log(count); // 獲取連線數量
    // console.log(socket.rooms); // 當前房間的唯一ID
    console.log(msg); // 接受前端傳入參數
    console.log(socket.rooms);
    console.log(loginList);
    io.emit("message", `收到來自 ${msg} 的訊息`);
  });
  socket.on("logout", (msg) => {
    console.log(msg, "即將被登出");
    const disconnectSomeOne = io.sockets.sockets.get(msg)._events;
    if (!!disconnectSomeOne) {
      disconnectSomeOne.disconnect(true);
      loginList = loginList.filter((item) => item.socketID !== socket.id);
      console.log(loginList, "目前登入人數");
    }
  });

  socket.on("disconnect", () => {
    const socketID = socket.id;
    console.log("用戶斷開連結了----------", socketID);
    loginList = loginList.filter((item) => item.socketID !== socketID);
    console.log(loginList, "當前連線伺服器的用戶");
  });
});
