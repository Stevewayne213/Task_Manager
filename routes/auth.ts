import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-taskboard-secret-key-12345';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Database Query: Check if user exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Bcrypt Function: Generate salt and hashpassword
    let passwordHash;
    try {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }

    // 3. Database Query: Create and persist new user (mapped to passwordHash schema field)
    let newUser;
    try {
      newUser = await User.create({
        name: name || email.split('@')[0],
        email,
        passwordHash, // Synced with IUser.passwordHash schema field
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to create user' });
    }

    // 4. JWT Signing Action: Generate auth token
    let token;
    try {
      token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Database Query: Find user by email
    let user;
    try {
      user = await User.findOne({ email });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Bcrypt Function: Validate password match
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. JWT Signing Action: Generate auth token
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
