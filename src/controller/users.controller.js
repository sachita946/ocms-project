import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma-client.js';

const SECRET = process.env.JWT_SECRET || 'change_this_secret';
const SALT_ROUNDS = 10;

export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, bio, expertise_area } = req.body;
    if (!email || !password || !first_name || !last_name) return res.status(400).json({ message: 'Missing fields' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, password: hashed, first_name, last_name, role: role || 'STUDENT' }
    });

    // create profile depending on role
    if (user.role === 'STUDENT') {
      await prisma.studentProfile.create({ data: { user_id: user.id, full_name: `${first_name} ${last_name}`, interests: [] } });
    } else if (user.role === 'INSTRUCTOR') {
      await prisma.instructorProfile.create({ data: { user_id: user.id, full_name: `${first_name} ${last_name}`, expertise_area: expertise_area || null, bio: bio || null } });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } });
  } catch (err) {
    console.error('register', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } });
  } catch (err) {
    console.error('login', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, first_name: true, last_name: true, role: true, profile_picture: true, created_at: true,
        studentProfile: true, instructorProfile: true
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('profile', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
//create user
const createUser = async(req,res)=>{
  console.log(req);
  try{
  const body = req.body;

  console.log("creating user:",body);
  //check if email already exists
  
  const existingUser = await prisma.user.findUnique({
    where:{
      email:body.email
    }
  });
  if(existingUser){
    return res.status(409).json({error:"email already exists"});
  };


//const hashed password = hash(password)
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(body.password,salt);
 const user = await prisma.user.create({
  data:{
    email: body.email,
        password: hashedPassword,
        first_name: body.first_name,
        last_name: body.last_name,
        profile_picture: body.profile_picture,
        role: body.role,
        is_active: body.is_active !== undefined ? body.is_active : true
        // created_at and updated_at are set automatically
}
});
const {password,  ..._user} = user;

res.status(201).json(_user);
}

catch (error){
  console.log(error);
  res.status(500).json({error:"internal server error"});
}
};
//get an id 
const getOneUser=(req,res)=>{
  const id = req.params.id;

  prisma.user.findUnique({
    where:{
      id:id
    }
  }).then((user)=>{
    if(!user){
      return res.status(404).json({error:"user not found"});
    }
    res.status(500).json(user);
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({error:'internal server error'});
  } );
}
// //create  updateuser
const updateUser = async (req, res) => {
  const id =req.params.id;
  const body = req.body;
const loggedInUser = req.user;


  try {
  const existingUser = await prisma.user.findUnique({
    where:{
      id:id
    }
  });
  if (!existingUser){
    return res.status(404).json({message:"you cannot update this information"});

  }
   if (loggedInUser.id!== parseInt(id)){
   return res.status(403).json({message:"you cannot update this information"});
}
  const user = await prisma.user.update({
    where:{
      id: id
    },
    data:{
  email   :      body.email,
  password: body.password,
  first_name    :body.first_name,
  last_name     :body.last_name,
  profile_picture : body.profile_picture,
  role      :     body.Role , 
  created_at  :body.DateTime ,
  is_active  :body.is_active 
    }
  });
  res.status(200).send(user);
}
catch(error){
  console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
  }
}

    
//  deleteUser
const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  try {
    await prisma.user.delete({
      where: { 
         id : parseInt(id)}
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
  }
}


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(401).json({ message: "invalid credential" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credential" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "login successfully",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

export {
  getAllUsers,
  createUser,
  getOneUser,
  loginUser,
  deleteUser,
  updateUser

}