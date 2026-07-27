import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, ProviderEnum, RoleEnum } from 'src/common/enum/user.enums';
import { SecurityModule } from '../common/module/security/security.module';
import { SecurityService } from '../common/module/security/security.service';
import { EmailService } from 'src/common/services/email.service';

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
  twoStepVerification: boolean;
}

@Schema({
  timestamps: true,
  strictQuery: true,
})
export class User implements IUser {
  @Prop({ type: String, required: true })
  userName!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({
    type: String,
    required: function (this: UserDocument): boolean {
      return this.provider == ProviderEnum.System;
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
  confirmEmail!: boolean;

  @Prop(String)
  profilePic!: string;

  @Prop([String])
  coverPics!: string[];

  @Prop(Number)
  age!: number;

  @Prop(String)
  phone!: string;

  @Prop({ type: Number, enum: GenderEnum, default: GenderEnum.Male })
  gender!: GenderEnum;

  @Prop({ type: Number, enum: RoleEnum, default: RoleEnum.User })
  role!: RoleEnum;

  @Prop(Date)
  changeCreditTime!: Date;

  @Prop(Date)
  deletedAt!: Date;

  @Prop({ type: Boolean, default: false })
  twoStepVerification!: boolean;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = SchemaFactory.createForClass(User);

const userModel = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    useFactory(SecurityService: SecurityService, EmailService: EmailService) {
      userSchema.pre(
        'save',
        async function (this: UserDocument & { wasNew: boolean }) {
          this.wasNew = this.isNew;

          if (this.isModified('password')) {
            this.password = await SecurityService.generateHash({
              plainText: this.password,
            });
          }

          if (this.phone && this.isModified('phone')) {
            this.phone = SecurityService.encryptValue({
              value: this.phone,
            });
          }
        },
      );

      userSchema.post(
        'save',
        async function (this: UserDocument & { wasNew: boolean }) {
          this.wasNew = this.isNew;

          try {
            if (this.wasNew) {
              await EmailService.sendConfirmEmail(this);
            }
          } catch (err) {
            console.log(err);
          }
        },
      );

      userSchema.pre(['findOne', 'find'], function () {
        const query = this.getQuery();

        if (!query.getSoftDelete) {
          this.setQuery({ ...query, deletedAt: { $exists: false } });
        }
      });

      return userSchema;
    },
    imports: [SecurityModule],
    inject: [SecurityService],
  },
]);

export default userModel;
