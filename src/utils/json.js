import jwt from 'jsonwebtoken';
//generetentoken
const generateToken = (user) => {
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '100h'
  });
  return token;
}

  //verify token
  const verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("verfiy token",decoded)
      return decoded;

    } catch (error) {
      return null;
    }
  };

export { generateToken, verifyToken };
// import jwt from 'jsonwebtoken';
// import prisma from '../utils/prisma-client.js';

// const SECRET = process.env.JWT_SECRET || 'change_this_secret';

// export async function auth(req, res, next) {
//   const h = req.headers.authorization;
//   if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
//   const token = h.slice(7);
//   try {
//     const payload = jwt.verify(token, SECRET);
//     // payload expected: { id, role }
//     if (!payload?.id) return res.status(401).json({ message: 'Invalid token' });
//     // attach basic user info
//     req.user = { id: payload.id, role: payload.role || 'STUDENT' };
//     // also attach studentProfile/instructorProfile ids for convenience
//     try {
//       const student = await prisma.studentProfile.findUnique({ where: { user_id: req.user.id } });
//       if (student) req.studentProfileId = student.id;
//     } catch {}
//     try {
//       const instructor = await prisma.instructorProfile.findUnique({ where: { user_id: req.user.id } });
//       if (instructor) req.instructorProfileId = instructor.id;
//     } catch {}
//     return next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// }