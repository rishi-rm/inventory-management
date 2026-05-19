const STORAGE_KEY = 'inventory_access';
const ACCESS_PIN = '7986';

export function getStoredAccessPin() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function isUnlocked() {
  return getStoredAccessPin() === ACCESS_PIN;
}

export function setStoredAccessPin(pin) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, pin);
  window.dispatchEvent(new Event('inventory-access-changed'));
}

export function clearStoredAccess() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('inventory-access-changed'));
}
