export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api',
  // Empty locally: the backend's ApiKeyFilter skips the check when its
  // BACKEND_API_KEY is unset, which is the default for local dev.
  apiKey: '',
};
