import z from 'zod';

export const commonValidationFields = {
  //   id: z.string().refine((value) => {
  //     return Types.ObjectId.isValid(value);
  //   }, 'Invalid ObjectId'),
  userName: z
    .string()
    .min(3, { error: 'username can not be less than 3 chars.' })
    .max(10, { error: 'username can not be more than 10 chars.' }),
  password: z
    .string()
    .regex(
      new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,16}/),
    ),

  email: z.email(),
  age: z.number().positive(),
  //   gender: z.enum(GenderEnum),
  phone: z.string().regex(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
  OTP: z.string().regex(new RegExp(/\d{6}/)),
};

export const loginSchema = {
  body: z.strictObject({
    email: commonValidationFields.email,
    password: commonValidationFields.password,
    FCM: z.string().optional(),
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      userName: commonValidationFields.userName,
      confirmPassword: z.string(),
      age: commonValidationFields.age,
      //   gender: commonValidationFields.gender.optional(),
      phone: commonValidationFields.phone.optional(),
    })
    .refine(
      (data) => {
        return data.confirmPassword === data.password;
      },
      { error: 'Passwords do not match.' },
    ),
};
