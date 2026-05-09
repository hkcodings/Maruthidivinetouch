import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";

console.log("LOGIN JS LOADED");

const btn = document.getElementById("loginBtn");

btn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("error");

  try {
    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "/dashboard/index.html";

  } catch (error) {
    console.error(error);
    errorEl.textContent = "Invalid email or password";
  }
});