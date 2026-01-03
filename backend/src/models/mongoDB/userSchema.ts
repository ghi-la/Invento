import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export type UserType = {
  _id?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string; // Optional because we may not want to expose it
  warehouses?: Array<{
    id: string;
    name: string;
  }>;
};

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Hash the password before saving
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = (await bcrypt.hash(this.password || '', salt)) || '';
});

// Compare hashed password with plain text password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
