import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {prisma} from '../utils/prisma-client.js';

const SECRET = process.env.JWT_SECRET || 'secret';
const SALT = 10;

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If a matching account exists, a reset link was sent' });
    }
    const resetToken = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    console.log(`Password reset token for ${email}: ${resetToken}`);
    return res.json({ message: 'Reset token generated (in production send via email)', resetToken });
  } catch (err) {
    console.error('forgotPassword', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });
    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const userId = payload.id;
    const hashed = await bcrypt.hash(password, SALT);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('resetPassword', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};