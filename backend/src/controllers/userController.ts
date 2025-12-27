import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import User from '../models/mongoDB/userSchema.ts';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res
        .status(400)
        .json({ message: 'User already exists with this email or username' });
      return;
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({ username, email, password });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res
      .status(500)
      .json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const fakeLogin = (req: any, res: any) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  // In a real app, you'd verify user credentials here

  // Create a real JWT token
  const token = jwt.sign({ username }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

  // Set token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Set token in Authorization header
  res.setHeader('Authorization', `Bearer ${token}`);

  res.json({ message: 'Login successful', token });
};

export const logout = (req: any, res: any) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

export const getAllUsers = async (_req: any, res: any): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords for security
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};