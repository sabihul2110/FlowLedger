// frontend/src/utils/withFallback.js

// Tries apiCall first. If it fails (offline), runs fallback.
export async function withFallback(apiCall, fallback) {
  try {
    return await apiCall();
  } catch (e) {
    console.warn('API failed, using local fallback:', e.message);
    return fallback ? await fallback() : null;
  }
}