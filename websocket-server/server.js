const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });
console.log("WebSocket server is running on ws://localhost:8080");

let ordersSent = 0;
let orderUpdates = [];

for (let i = 1; i <= 100; i++) {
  orderUpdates.push({
    AppOrderId: i,
    price: Math.floor(Math.random() * 1000),
    triggerPrice: Math.floor(Math.random() * 1000),
    priceType: ["MKT", "LMT", "SL-LMT", "SL-MKT"][
      Math.floor(Math.random() * 4)
    ],
    producttype: "Equity",
    status: ["complete", "open", "pending", "cancelled"][
      Math.floor(Math.random() * 4)
    ],
    exchange: "NSE",
    symbol: "AAPL",
  });
}

server.on("connection", (ws) => {
  console.log("Client connected");

  const sendUpdates = (count, delay) => {
    setTimeout(() => {
      for (let i = 0; i < count; i++) {
        if (ordersSent < orderUpdates.length) {
          const order = orderUpdates[ordersSent];
          ws.send(JSON.stringify(order));
          console.log(
            `Sent order updates: ${JSON.stringify(
              order
            )},Time:${new Date().toLocaleTimeString()}`
          );
          ordersSent++;
        }
      }
    }, delay);
  };

  sendUpdates(10, 1000);
  sendUpdates(20, 3000);
  sendUpdates(40, 6000);
  sendUpdates(30, 11000);
});
