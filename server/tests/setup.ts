process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret-at-least-16-chars';
// Integration tests require a MongoDB instance.
// Start one with: docker compose up -d mongo   (or set TEST_MONGODB_URI).
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? 'mongodb://127.0.0.1:27017/aurawell_test';
process.env.AI_API_KEY = '';
