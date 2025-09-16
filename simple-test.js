// Simple schema validation test
const mongoose = require("mongoose");

// Test data structure
const testUpdate = {
  details: [
    {
      type: "route",
      name: "Day 1 - Test Route",
      index: 1,
      data: [
        {
          type: "place",
          name: "Test Restaurant",
          address: "123 Test Street",
          cost: {
            type: "VND",
            value: 500000,
            paidBy: "John Doe",
            description: "Test cost",
            splitBetween: [
              {
                userId: "user123",
                name: "John Doe",
                amount: 500000,
                settled: false,
                selected: true,
              },
            ],
          },
        },
      ],
    },
  ],
};

console.log("🔍 Testing data structure:");
console.log("- Details count:", testUpdate.details.length);
console.log("- Route name:", testUpdate.details[0].name);
console.log("- Data count:", testUpdate.details[0].data.length);
console.log("- Place name:", testUpdate.details[0].data[0].name);
console.log("- Cost value:", testUpdate.details[0].data[0].cost?.value);
console.log("- Cost structure valid:", !!testUpdate.details[0].data[0].cost);

// Check if discriminator fields are present
const detail = testUpdate.details[0];
console.log("\n📋 Discriminator validation:");
console.log("- Detail has type:", !!detail.type);
console.log("- Detail has name:", !!detail.name);
console.log("- Detail has index:", !!detail.index);

const placeItem = detail.data[0];
console.log("- Place has type:", !!placeItem.type);
console.log("- Place type value:", placeItem.type);

console.log("\n💰 Cost object structure:");
console.log(JSON.stringify(placeItem.cost, null, 2));
