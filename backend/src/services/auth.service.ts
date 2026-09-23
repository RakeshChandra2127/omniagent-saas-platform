import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error';
// Assuming Tenant and User models exist
import { Tenant } from '../models/tenant.model';
import { User } from '../models/user.model';
import { AuthPayload } from '../middleware/auth.middleware';

export class AuthService {
  async register(tenantName: string, email: string, password: string, firstName: string, lastName: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already in use', 400, 'EMAIL_EXISTS');
    }

    const tenant = await Tenant.create({ name: tenantName });
    const user = await User.create({
      tenantId: tenant._id,
      email,
      password,
      firstName,
      lastName,
      role: 'tenant_admin'
    });

    const token = this.generateToken({ userId: user.id, tenantId: tenant.id, role: user.role });
    return { user, tenant, token };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.generateToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    return { user, token };
  }

  generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
  }

  verifyToken(token: string): AuthPayload {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as AuthPayload;
  }
}

export const authService = new AuthService();
