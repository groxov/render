import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, UserRecord } from '../models/User';
import { ApiError, asyncHandler, sendSuccess } from '../utils/http';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body as LoginPayload;
  const user = await UserModel.findByLogin(username);

  if (!user) {
    throw new ApiError(401, 'Неверный логин или пароль');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new ApiError(401, 'Неверный логин или пароль');
  }

  return sendSuccess(res, {
    token: signToken(user),
    user: mapUser(user),
  });
});

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, name } = req.body as RegisterPayload;

  const existingUser = await UserModel.findByUsernameOrEmail(username, email);
  if (existingUser) {
    throw new ApiError(400, 'Пользователь с таким логином или email уже существует');
  }

  const user = await UserModel.create({
    username,
    email,
    password_hash: await bcrypt.hash(password, 10),
    user_type: 'user',
    name: name ?? null,
  });

  return sendSuccess(
    res,
    {
      token: signToken(user),
      user: mapUser(user),
    },
    201,
  );
});

function signToken(user: Pick<UserRecord, 'id' | 'username' | 'user_type'>) {
  return jwt.sign(
    { id: user.id, username: user.username, user_type: user.user_type },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function mapUser(user: UserRecord) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    user_type: user.user_type,
    name: user.name,
  };
}

