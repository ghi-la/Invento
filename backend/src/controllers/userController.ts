import jwt from 'jsonwebtoken';

import User from '../models/mongoDB/userSchema.ts';

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