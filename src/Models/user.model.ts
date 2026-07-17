import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from 'src/common/enum/user.enums';
import { AuthModule } from 'src/module/auth/auth.module';
import { AuthService } from 'src/module/auth/auth.service';

export interface IUser {
  userName: string;
  email: string;
  password: string;
  provider: ProviderEnum;
  confirmEmail: boolean;
  profilePic: string;
  coverPics: string[];
  age: number;
  phone: string;
  gender: GenderEnum;
  role: RoleEnum;
  changeCreditTime: Date;
  deletedAt: Date;
  twoStepVerification: Boolean;
}

export type IHUser = HydratedDocument<IUser>;

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class User {
  @Prop({ type: String, required: true })
  userName!: string;
  @Prop({ type: String, required: true })
  email!: string;

  @Prop({
    type: String,
    required: function (data): boolean {
      return data.provider == ProviderEnum.System;
    },
  })
  password!: string;

  @Prop({
    type: Number,
    enum: ProviderEnum,
    default: ProviderEnum.System,
  })
  provider!: ProviderEnum;

  @Prop({ type: Boolean, default: false })
  confirmEmail!: Boolean;

  @Prop(String)
  profilePic!: String;

  @Prop([String])
  coverPics!: [String];

  @Prop(Number)
  age!: Number;

  @Prop(String)
  phone!: String;

  @Prop({ type: Number, enum: GenderEnum, default: GenderEnum.Male })
  gender!: GenderEnum;

  @Prop({ type: Number, enum: RoleEnum, default: RoleEnum.User })
  role!: RoleEnum;

  @Prop(Date)
  changeCreditTime!: Date;

  @Prop(Date)
  deletedAt!: Date;

  @Prop({ type: Boolean, default: false })
  twoStepVerification!: Boolean;
}

const userSchema = SchemaFactory.createForClass(User);

// userSchema.pre('save', async function (this: IHUser & { wasNew: boolean }) {
//   this.wasNew = this.isNew;

//   if (this.isModified('password')) {
//     this.password = await generateHash({
//       plainText: this.password,
//     });
//   }

//   if (this.phone && this.isModified('phone')) {
//     this.phone = encryptValue({ value: this.phone });
//   }
// });

// userSchema.post('save', async function (this: IHUser & { wasNew: boolean }) {
//   this.wasNew = this.isNew;

//   try {
//     if (this.wasNew) {
//       await MailService.sendConfirmEmail(this);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });

userSchema.pre(['findOne', 'find'], function () {
  const query = this.getQuery();

  if (!query.getSoftDelete) {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});

const userModel = MongooseModule.forFeature([
  {
    name: User.name,
    schema: userSchema,
  },
]);

export default userModel;
