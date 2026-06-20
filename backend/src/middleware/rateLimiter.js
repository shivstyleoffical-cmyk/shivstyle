import rateLimit from 'express-rate-limit';

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.'
  }
});

// Rate limiter specifically for registration
export const registerRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Allow max 5 registration attempts per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many registration attempts, please try again later.'
  }
});
