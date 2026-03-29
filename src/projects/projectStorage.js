const DB_NAME = "railway-tooling-projects";
const DB_VERSION = 1;
const STORE_NAME = "state";
const STATE_KEY = "project-store-v1";
const FALLBACK_KEY = "railway-tooling-projects-fallback-v1";

function hasIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function loadFallbackState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveFallbackState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota and serialization failures in fallback mode.
  }
}

export async function loadProjectState() {
  if (!hasIndexedDb()) return loadFallbackState();
  try {
    const db = await openDb();
    const state = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(STATE_KEY);
      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => reject(request.error);
    });
    return state ?? loadFallbackState();
  } catch {
    return loadFallbackState();
  }
}

export async function saveProjectState(state) {
  saveFallbackState(state);
  if (!hasIndexedDb()) return;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ key: STATE_KEY, value: state });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback copy is already saved.
  }
}
