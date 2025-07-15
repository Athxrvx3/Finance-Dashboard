// Save data for a specific user
export function saveUserData(username, key, value) {
  if (!username) return;
  localStorage.setItem(`${key}_${username}`, JSON.stringify(value));
}

// Load data for a specific user
export function loadUserData(username, key, defaultValue) {
  if (!username) return defaultValue;
  const data = localStorage.getItem(`${key}_${username}`);
  return data ? JSON.parse(data) : defaultValue;
}

// Optional: Clear data for a specific user and key
export function clearUserData(username, key) {
  if (!username) return;
  localStorage.removeItem(`${key}_${username}`);
}