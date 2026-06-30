import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { signToken } from '../utils/jwt.js';
import {
  RegisterInput,
  LoginInput,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../types/index.js';

// ============================================================================
// Auth Service — Registration, Login, and Profile Retrieval
// ============================================================================

const BCRYPT_ROUNDS = 12;

/**
 * Register a new user.
 * Validates required fields, checks for existing email/username,
 * hashes the password, creates the user, and returns user data + JWT.
 */
export async function register(input: RegisterInput) {
  const { username, email, password } = input;

  // Validate required fields
  if (!username || !email || !password) {
    throw new ValidationError('Username, email, and password are required');
  }

  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // Check for existing user by email or username
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw new ConflictError('Email is already registered');
    }
    throw new ConflictError('Username is already taken');
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  // Generate JWT
  const accessToken = signToken({ userId: user.id, email: user.email });

  // Return user without passwordHash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: { accessToken, expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  };
}

/**
 * Log in an existing user.
 * Finds user by email, verifies password, and returns user data + JWT.
 */
export async function login(input: LoginInput) {
  const { email, password } = input;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT
  const accessToken = signToken({ userId: user.id, email: user.email });

  // Return user without passwordHash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token: { accessToken, expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  };
}

/**
 * Get the currently authenticated user's profile.
 * Returns user data without passwordHash.
 */
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  const { passwordHash: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
