const { isDuplicateOrRedundant, receivedOrders } = require("./listener.js");

const testOrders = [
  {
    AppOrderID: 1111075001,
    price: 100,
    triggerPrice: 150,
    priceType: "MKT",
    productType: "Equity",
    status: "open",
    exchange: "NSE",
    symbol: "AAPL",
  },
  {
    AppOrderID: 1111075002,
    price: 200,
    triggerPrice: 250,
    priceType: "LMT",
    productType: "Equity",
    status: "complete",
    exchange: "NSE",
    symbol: "GOOGL",
  },
  {
    AppOrderID: 1111075002,
    price: 200,
    triggerPrice: 250,
    priceType: "LMT",
    productType: "Equity",
    status: "complete",
    exchange: "NSE",
    symbol: "GOOGL",
  },
];

// Test the function with test orders
testOrders.forEach((order) => {
  console.log(`Testing order: ${JSON.stringify(order)}`);
  console.log("Is redundant:", isDuplicateOrRedundant(order));
  if (!isDuplicateOrRedundant(order)) {
    receivedOrders.push(order);
  }
});
