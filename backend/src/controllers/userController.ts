import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserType } from '../models/mongoDB/userSchema.ts';
import User from '../models/mongoDB/userSchema.ts';
import { getWarehousesForUser } from '../utils/userHelpers.ts';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
    }

    const userData: UserType = {
      username,
      email,
      password,
    };

    const newUser = new User(userData);

    await newUser.save();

    res.status(201).json({ message: 'User created', user: newUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const warehouses = await getWarehousesForUser(user._id?.toString() || '');

    const userData: UserType = {
      _id: user._id,
      username: user.username,
      email: user.email,
      warehouses,
    };

    // Only include minimal info in JWT
    const tokenPayload = userData;

    // Create JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send token as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
      sameSite: 'strict', // Prevents CSRF
      maxAge: 3600000, // 1 hour expiration
    });

    res.status(200).json({
      message: 'Login successful',
      data: {
        ...userData,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let token = req.headers?.cookie;
    if (!token) {
      token = req.headers.authorization;
      if (!token) {
        throw new Error('No token provided');
      }
    } else {
      token = token?.split('token=')[1];
    }

    const decoded: any = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    );
    if (!decoded) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    console.log('Decoded token:', decoded);
    // Read user data from the db
    const userId = decoded._id;

    const user = await User.findById(userId, { password: 0 }); // Exclude password for security
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const warehouses = await getWarehousesForUser(user._id?.toString() || '');

    const userData: UserType = {
      _id: user._id,
      username: user.username,
      email: user.email,
      warehouses,
    };

    res.status(200).json({ data: userData });
  } catch (error: any) {
    res.status(401).json({ message: 'User not authenticated' });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.query;

    const user = await User.findById(userId, { password: 0 }); // Exclude password for security
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const warehouses = await getWarehousesForUser(user._id?.toString() || '');

    const userData: UserType = {
      _id: user._id,
      username: user.username,
      email: user.email,
      warehouses,
    };

    res.status(200).json({ message: 'User found', data: userData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// export const updateUser = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { _id, name, surname, username, email, myKeywords } = req.body;

//     const user = await User.findById(_id);

//     if (!user) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }
//     // Update user fields
//     user.name = name || user.name;
//     user.surname = surname || user.surname;
//     user.username = username || user.username;
//     user.email = email || user.email;
//     user.myKeywords = myKeywords || user.myKeywords;

//     await user.save();
//     res.status(200).json({ message: 'User updated successfully', data: user });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getUsersStats = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const users = await User.find({}, { password: 0 });
//     const totalUsers = users.length;
//     const totalFollowers = users.reduce(
//       (acc: number, user: any) => acc + (user.followers?.length || 0),
//       0
//     );
//     const totalFollowing = users.reduce(
//       (acc: number, user: any) => acc + (user.following?.length || 0),
//       0
//     );
//     res.status(200).json({
//       totalUsers,
//       totalFollowers,
//       totalFollowing,
//       avgFollowersPerUser: totalUsers > 0 ? totalFollowers / totalUsers : 0,
//       avgFollowingPerUser: totalUsers > 0 ? totalFollowing / totalUsers : 0,
//     });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getUserByQuery = async (
//   req: any,
//   res: Response
// ): Promise<void> => {
//   const { query } = req.query;

//   if (!query) {
//     res.status(400).json({ error: 'Missing required fields' });
//     return;
//   }
//   try {
//     const users = await User.find(
//       {
//         $or: [
//           { name: { $regex: query, $options: 'i' } },
//           { surname: { $regex: query, $options: 'i' } },
//           { username: { $regex: query, $options: 'i' } },
//           { email: { $regex: query, $options: 'i' } },
//         ],
//       },
//       { password: 0 } // Exclude passwords for security
//     );

//     if (users.length === 0) {
//       res.status(404).json({ message: 'No users found' });
//       return;
//     }

//     res.status(200).json(users);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// TODO: just for test, remove
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords for security
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
