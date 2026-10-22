import jwt from 'jsonwebtoken';
import { User } from '../features/auth/user.model.js';
import { getUserById } from '../features/auth/auth.service.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.atelier_token) {
    token = req.cookies.atelier_token;
  }
  // 2. Check Authorization Bearer header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Server security configuration error: JWT_SECRET is missing.',
      });
    }
    const decoded = jwt.verify(token, secret);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token verification failed.',
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.atelier_token) {
    token = req.cookies.atelier_token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret);
        req.user = await getUserById(decoded.id);
      }
    } catch (err) {
      // Ignored for optional auth (treat as guest)
    }
  }
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'Guest'}' lacks access clearance for this resource.`,
      });
    }
    next();
  };
};
