const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let clients = [];

io.on("connection", (socket) => {
  clients.push(socket);

  console.log("Client connected");

  socket.on("message", (message) => {
    let msg = JSON.parse(message);

    // Broadcast received message to all clients except the sender
    clients.forEach((client) => {
      if (client !== socket) {
        client.send(JSON.stringify(msg));
      }
    });
  });

  socket.on("disconnect", () => {
    // Remove closed connection from clients array
    clients = clients.filter((client) => client !== socket);
    console.log("Client disconnected");
  });
});

server.listen(7777, "0.0.0.0", () => {
  console.log("Socket.IO server started on port 7777");
});
