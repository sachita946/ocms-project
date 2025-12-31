import { prisma } from '../utils/prisma-client.js';
import { generateToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        created_at: true
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const body = req.body;
    const { first_name, last_name, email, password, role } = body;

    if (!email || !password || !first_name) {
      return res.status(400).json({ error: 'first_name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name: last_name || '',
        email,
        password: hashedPassword,
        role: role || 'STUDENT'
      }
    });

    const { password: _pw, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one user by ID
const getOneUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        created_at: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const loggedInUser = req.user;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!loggedInUser || loggedInUser.id !== parseInt(id)) {
      return res.status(403).json({ message: 'You cannot update this information' });
    }

    let hashedPassword;
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(body.password, salt);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        first_name: body.first_name ?? existingUser.first_name,
        last_name: body.last_name ?? existingUser.last_name,
        email: body.email ?? existingUser.email,
        role: body.role ?? existingUser.role,
        ...(hashedPassword ? { password: hashedPassword } : {})
      }
    });

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getAllUsers,
  createUser,
  getOneUser,
  loginUser,
  deleteUser,
  updateUser
};