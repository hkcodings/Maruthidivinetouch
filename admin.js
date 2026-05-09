import { auth, db } from './src/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc as docRef } from "firebase/firestore";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in → send to login page
    window.location.href = "/admin/index.html";
  }
});


// DOM
const messageContainer = document.getElementById("messages");
const orderContainer = document.getElementById("orders");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/admin/index.html";
  } else {
    // ✅ ONLY load data if logged in
    loadMessages();
    loadOrders();
  }
});


async function loadMessages() {
  try {
    const querySnapshot = await getDocs(collection(db, "contacts"));

    messageContainer.innerHTML = "";

    if (querySnapshot.empty) {
      messageContainer.innerHTML = "<p class='empty'>No messages found</p>";
      return;
    }

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      const time = data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : '';

      messageContainer.innerHTML += `
        <div class="card">
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong> ${data.message}</p>
          <p class="time">${time}</p>

          <button class="delete-btn" onclick="deleteMessage('${docSnap.id}')">
            🗑 Delete
          </button>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error loading messages:", error);
    messageContainer.innerHTML = "<p>Error loading messages</p>";
  }
}


// ======================
// 🗑 DELETE MESSAGE
// ======================
window.deleteMessage = async (id) => {
  try {
    await deleteDoc(docRef(db, "contacts", id));
    loadMessages(); // refresh
  } catch (error) {
    console.error("Delete error:", error);
  }
};


// ======================
// 📦 LOAD ORDERS
// ======================
async function loadOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));

    orderContainer.innerHTML = "";

    if (querySnapshot.empty) {
      orderContainer.innerHTML = "<p class='empty'>No orders found</p>";
      return;
    }

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      const time = data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : '';

      // ✅ SAFE ITEMS HANDLING
      let itemsHTML = "<li>No items</li>";

      if (Array.isArray(data.items)) {
        itemsHTML = data.items.map(item => `
          <li>
            ${item.name} (x${item.qty}) - ₹${item.price}
          </li>
        `).join('');
      }

      orderContainer.innerHTML += `
        <div class="card">
          <p><strong>Total:</strong> ₹${data.total}</p>

          <ul class="order-items">
            ${itemsHTML}
          </ul>

          <p class="time">${time}</p>
          <button class="delete-btn" onclick="deleteMessage('${docSnap.id}')">
            🗑 Delete
          </button>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error loading orders:", error);
    orderContainer.innerHTML = "<p>Error loading orders</p>";
  }
}


