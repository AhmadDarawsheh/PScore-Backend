import joi from 'joi';

export const signupValidation = joi.object({

    userName:joi.string().required().min(3).max(20),

    email:joi.string().required().email(),

    password:joi.string().min(8).max(30),

    age:joi.number().min(18).max(60),


    


})