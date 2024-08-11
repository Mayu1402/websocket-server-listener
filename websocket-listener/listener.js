const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:8080");

const clientID = Math.floor(Math.random() * 10000000);

let receivedOrders = [];
let orderActions = [];
let updateBuffer = [];
let bufferTimeout = null;

const isDuplicateOrRedundant = (order) => {
  return receivedOrders.some(
    (existingOrder) =>
      existingOrder.AppOrderID === order.AppOrderID &&
      existingOrder.price === order.price &&
      existingOrder.triggerPrice === order.triggerPrice &&
      existingOrder.priceType === order.priceType &&
      existingOrder.productType === order.productType &&
      existingOrder.status === order.status &&
      existingOrder.exchange === order.exchange &&
      existingOrder.symbol === order.symbol
  );
};

const determineAction = (order) => {
  const exists = receivedOrders.some((o) => o.AppOrderID === order.AppOrderID);
  if (order.status === "cancelled") {
    return "cancelOrder";
  } else if (!exists) {
    if (
      (order.priceType === "MKT" && order.status === "complete") ||
      (order.priceType === "LMT" && order.status === "open") ||
      ((order.priceType === "SL-LMT" || order.priceType === "SL-MKT") &&
        order.status === "pending")
    ) {
      return "placeOrder";
    }
  } else {
    if (
      (order.priceType === "MKT" && order.status === "complete") ||
      (order.priceType === "LMT" && order.status === "open") ||
      ((order.priceType === "SL-LMT" || order.priceType === "SL-MKT") &&
        order.status === "pending")
    ) {
      return "modifyOrder";
    }
  }

  return null;
};

const processBuffer = () => {
  if (updateBuffer.length > 0) {
    const uniqueUpdate = updateBuffer[0];
    console.log(`Processing update:${JSON.stringify(uniqueUpdate)}`);
    console.log(
      `Update sent to order book at ${new Date().toISOString()} for ClientID ${clientID} :${JSON.stringify(
        uniqueUpdate
      )} `
    );
    const action = determineAction(uniqueUpdate);
    if (action) {
      orderActions.push({
        order: uniqueUpdate,
        action,
        time: new Date().toISOString(),
      });
      console.log(
        `Action determined:${action} for order : ${JSON.stringify(
          uniqueUpdate
        )}, Time:${new Date().toLocaleTimeString()}`
      );
    }
    updateBuffer = [];
  }
};

ws.on("message", (message) => {
  try {
    const order = JSON.parse(message);
    console.log("Received Order:", JSON.stringify(order));

    const isRedundant = isDuplicateOrRedundant(order);
    console.log("IS Redundant:", isRedundant);

    if (!isRedundant) {
      const action = determineAction(order);
      console.log("Determined Action:", action);

      if (action) {
        orderActions.push({
          order,
          action,
          time: new Date().toISOString,
        });
        console.log(
          `Action determined: ${action} for order:${JSON.stringify(
            order
          )}, Time:${new Date().toLocaleTimeString()}`
        );
      }

      receivedOrders.push(order);

      if (bufferTimeout) clearTimeout(bufferTimeout);

      updateBuffer.push(order);

      bufferTimeout = setTimeout(() => {
        processBuffer();
      }, 1000);
    } else {
      console.log(`Filtered redundant order:${JSON.stringify(order)}`);
    }
  } catch (error) {
    console.log.error(`Error :${error.message}`);
  }
});

ws.on("error", (error) => {
  console.error(`Websocket error:${error.message}`);
});

ws.on("close", () => {
  console.log("WebSocket connection closed.");
});

module.exports = { isDuplicateOrRedundant, receivedOrders };
