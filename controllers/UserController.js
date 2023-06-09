import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import UserModel from '../models/User.js';
export const register = async (req, res) => {
    try {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash(password, salt);
  
      const doc = new UserModel({
        fullName: req.body.fullName,
        email: req.body.email,
        passwordHash: passHash,
        avatarUrl: req.body.avatarUrl,
      });
      const user = await doc.save();
  
      const token = jwt.sign(
        {
          _id: user._id,
        },
        'secret124',
        {
          expiresIn: '30d',
        },
      );
      const {passwordHash, ...userData} = user._doc
      res.json({
        ...userData,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Не удалось зарегистрироваться ',
      });
    }
}
export const login = async (req, res)=> {
    try {
      const user = await UserModel.findOne({email: req.body.email})
      if(!user){
        return res.status(404).json({
          message: 'Неверный логин или пароль',
        });
      }
      const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
      if(!isValidPass){
        return res.status(400).json({
          message: 'Неверный логин или пароль',
        });
      }
      const token = jwt.sign(
        {
          _id: user._id,
        },
        'secret124',
        {
          expiresIn: '30d',
        },
      );
      const {passwordHash, ...userData} = user._doc
      res.json({
        ...userData,
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Не удалось авторизоваться ',
      });
    }
}
export const getMe = async (req,res) => {
  const user = await UserModel.findById(req.userId)
  if(user){
    const {passwordHash, ...userData} = user._doc
    res.json(userData);
  }
  else{
    res.json(null);
  }
}