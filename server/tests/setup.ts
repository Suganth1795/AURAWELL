process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-session-secret-at-least-16-chars';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI ?? 'mongodb://localhost:27017/aurawell-test';
