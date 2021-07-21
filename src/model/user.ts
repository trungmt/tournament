import { Schema, model, Document, ObjectId } from 'mongoose';
import bcryptjs from 'bcryptjs';

export type UserJson = {
  _id: ObjectId;
  username: string;
  name: string;
};

type User = Document &
  UserJson & {
    password?: string;
    avatar?: Buffer;
  };

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
    },
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password!, 8);
  }

  next();
});

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.avatar;

  return userObject;
};

const UserModel = model<User>('User', userSchema);

export default UserModel;
