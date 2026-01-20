// src/auth.ts
const ADMIN_ID = "mom";
const ADMIN_PASS = "bolati123"; // change this

const KEY = "bp_logged_in";

export function isAuthed() {
  return localStorage.getItem(KEY) === "true";
}

export function login(id: string, pass: string) {
  const ok = id === ADMIN_ID && pass === ADMIN_PASS;
  if (ok) localStorage.setItem(KEY, "true");
  return ok;
}

export function logout() {
  localStorage.removeItem(KEY);
  location.assign("/login");
}
