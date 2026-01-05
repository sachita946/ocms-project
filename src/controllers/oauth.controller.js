import {prisma} from'../utils/prisma-client.js';
import { generateToken } from "../utils/jwt.js";

export const googleAuthSuccess = async (req, res) => {
  try {
    const profile = req.user;
    const email = profile.emails?.[0]?.value?.toLowerCase();
    
    if (!email) {
      return res.redirect('/auth/login.html?error=no_email');
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          first_name: profile.name?.givenName || 'User',
          last_name: profile.name?.familyName || '',
          role: 'STUDENT',
          password: ''
        }
      });

      // Create student profile
      await prisma.studentProfile.create({
        data: {
          user_id: user.id,
          full_name: `${user.first_name} ${user.last_name}`.trim(),
          interests: []
        }
      });
    }

    const token = generateToken(user);
    return res.redirect(`/oauth-success.html?token=${token}&role=${user.role}`);
  } catch (err) {
    console.error('googleAuthSuccess error:', err);
    return res.redirect('/auth/login.html?error=oauth_failed');
  }
};

export const facebookAuthSuccess = async (req, res) => {
  try {
    const profile = req.user;
    const email = profile.emails?.[0]?.value?.toLowerCase() || `fb_${profile.id}@ocms.local`;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          first_name: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
          last_name: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'STUDENT',
          password: ''
        }
      });
      await prisma.studentProfile.create({
        data: {
          user_id: user.id,
          full_name: `${user.first_name} ${user.last_name}`.trim(),
          interests: []
        }
      });
    }

    const token = generateToken(user);
    return res.redirect(`/oauth-success.html?token=${token}&role=${user.role}`);
  } catch (err) {
    console.error('facebookAuthSuccess error:', err);
    return res.redirect('/auth/login.html?error=oauth_failed');
  }
};
