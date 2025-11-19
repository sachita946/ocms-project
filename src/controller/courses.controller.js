import {prisma} from '../utils/prisma-clients.js';
import { generateToken } from '../utils/json.js';

import bcrypt from 'bcrypt';



const  getAllCourse = async(req,res)=>{
  try{
    const {name, email} = req.query;
    const courses = await prisma.course.findMany(
    {
      where:{
...(name&& {name:{contains:name}}),
...(email&&{email:{contains:email}})
        
      }
    }
  );
    res.status(200).json(courses);

  }
  catch(error){
    console.log(error);
    res.status(500).json({error:'internal server error'});
  }
};


const createCourse = async(req,res)=>{
  console.log(req);
  try{
  const body = req.body;

  console.log("creating course:",body);
  //check if email already exists

  const existingCourse = await prisma.course.findUnique({
    where:{
      email:body.email
    }
  });
  if(existingCourse){
    return res.status(409).json({error:"email already exists"});
  };
  }catch (error){
  console.log(error);
  res.status(500).json({error:"internal server error"});
  }
  }

// //const hashed password = hash(password)
// const salt = await bcrypt.genSalt(10);
// const hashedPassword = await bcrypt.hash(body.password,salt);








//   const user = await prisma.user.create({
//   data:{
//     email: body.email,
//         password: hashedPassword,
//         first_name: body.first_name,
//         last_name: body.last_name,
//         profile_picture: body.profile_picture,
//         role: body.role,
//         is_active: body.is_active !== undefined ? body.is_active : true
//         // created_at and updated_at are set automatically
// }
// });
// const {password,  ..._user} = user;

// res.status(201).json(_user);
// }

// catch (error){
//   console.log(error);
//   res.status(500).json({error:"internal server error"});
// }
// };



//get an id 
const getOneCourse = (req, res) => {
  const id = req.params.id;

  prisma.course.findUnique({
    where:{
      id:id
    }
  }).then((course)=>{
    if(!course){
      return res.status(404).json({error:"course not found"});
    }
    res.status(200).json(course);
  }).catch((error)=>{
    console.log(error);
    res.status(500).json({error:'internal server error'});
  } );
}
// //create  updatecourse
const updateCourse = async (req, res) => {
  const id =req.params.id;
  const body = req.body;
const loggedInCourse = req.course;


  try {
  const existingCourse = await prisma.course.findUnique({
    where:{
      id:id
    }
  });
  if (!existingCourse) {
    return res.status(404).json({ message: "you cannot update this information" });
  }
  if (loggedInCourse.id !== parseInt(id)) {
    return res.status(403).json({ message: "you cannot update this information" });
}
  const course = await prisma.course.update({
    where:{
      id: id
    },
    data:{
  title           : body.title,
  description     : body.description,
  instructor_id   : body.instructor_id,
  category        : body.category,
  level           : body.level,
  language        : body.language,
  duration_weeks  : body.duration_weeks,
  price           : body.price,
  discount_price  : body.discount_price,
  thumbnail_url   : body.thumbnail_url,
  promo_video_url : body.promo_video_url,
  is_published    : body.is_published,
  last_edition    : body.last_edition,
  requirements    : body.requirements,
  learning_outcomes: body.learning_outcomes
    }
  });
  res.status(200).send(course);
}
catch(error){
  console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
  }
}

    
//  deletecourse
const deleteCourse = async (req, res) => {
  const id = parseInt(req.params.id);
  const body = req.body;
  try {
    await prisma.course.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"});
  }
}


const loginCourse = async (req, res) => {
  try {
    const { email, password } = req.body;
    const course = await prisma.course.findUnique({
      where: { email }
    });
    if (!course) {
      return res.status(401).json({ message: "invalid credential" });
    }
    const isMatch = await bcrypt.compare(password, course.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credential" });
    }

    const token = generateToken(course);

    res.status(200).json({
      message: "login successfully",
      token: token,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        instructor_id: course.instructor_id,
        category: course.category,
        level: course.level,
        language: course.language,
        duration_weeks: course.duration_weeks,
        price: course.price,
        discount_price: course.discount_price,
        thumbnail_url: course.thumbnail_url,
        promo_video_url: course.promo_video_url,
        is_published: course.is_published,
        last_edition: course.last_edition,
        requirements: course.requirements,
        learning_outcomes: course.learning_outcomes
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

export {
  getAllCourse,
  createCourse,
  getOneCourse,
  loginCourse,
  deleteCourse,
  updateCourse

}
