{
  tokenId: "TK-20260606-000124",
  itemId: "RICE-01",
  itemName: "Chicken Rice",
  category: "Rice",
  qty: 2,
  weightGrams: 350,
  customerId: "CUST-004",
  shiftId: "SHIFT-20260606",
  status: "ACTIVE", // ACTIVE | REFUNDED
  createdAt: 1717651245123,
  refundedAt: null
}
{
  refundId: "RF-00091",
  tokenId: "TK-20260606-000124",
  approvedBy: "ADMIN",
  reason: "Wrong order",
  timestamp: 1717654441000
}
export const Store = {
  state: {
    tokens: [],
    refunds: [],
    customers: [],
    shift: null
  },

  set(key, value) {
    this.state[key] = value;
    this.persist();
  },

  get(key) {
    return this.state[key];
  },

  persist() {
    localStorage.setItem("POS_DB", JSON.stringify(this.state));
  },

  hydrate() {
    const db = JSON.parse(localStorage.getItem("POS_DB"));
    if (db) this.state = db;
  }
};
import { Store } from "./store.js";

export function createToken(payload) {
  const token = {
    tokenId: generateTokenId(),
    status: "ACTIVE",
    createdAt: Date.now(),
    refundedAt: null,
    ...payload
  };

  Store.get("tokens").push(token);
  Store.persist();
  return token;
}

export function refundToken(tokenId, approvedBy) {
  const token = Store.get("tokens").find(t => t.tokenId === tokenId);

  if (!token || token.status === "REFUNDED") {
    throw new Error("Invalid or already refunded token");
  }

  token.status = "REFUNDED";
  token.refundedAt = Date.now();

  Store.get("refunds").push({
    refundId: `RF-${Date.now()}`,
    tokenId,
    approvedBy,
    timestamp: Date.now()
  });

  Store.persist();
}
export function verifyPIN(inputPin) {
  const ADMIN_PIN = "4321";
  return inputPin === ADMIN_PIN;
}
export function renderLiveLogs(tokens) {
  const tbody = document.getElementById("live-log");
  tbody.innerHTML = "";

  tokens
    .filter(t => t.status === "ACTIVE")
    .forEach(t => {
      tbody.innerHTML += `
        <tr>
          <td>${new Date(t.createdAt).toLocaleTimeString()}</td>
          <td>${t.itemName}</td>
          <td class="text-center">${t.qty}</td>
          <td class="text-center">
            <button onclick="openRefundModal('${t.tokenId}')">Refund</button>
          </td>
        </tr>
      `;
    });
}
