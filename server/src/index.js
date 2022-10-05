const { PeerServer } = require("peer");

const port = parseInt(process.env.PORT || "9000", 10);

const server = PeerServer({
  port,
  path: "/peer",
});

server.on("connection", (client) => {
  console.log("connection: ", client.getId());
});
server.on("disconnect", (client) => {
  console.log("disconnect: ", client.getId());
});
