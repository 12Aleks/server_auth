import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from '../users/schema/user.schema';
import { JwtPayload } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    public jwt: JwtService,
    public usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) return user;
    return null;
  }

  async login(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });

    await this.usersService.setRefreshToken(user._id.toString(), refreshToken);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload: JwtPayload = this.jwt.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) throw new Error();
      return this.login(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async register(email: string, password: string) {
    return this.usersService.create(email, password);
  }

  async logout(token: string) {
    const payload: JwtPayload = this.jwt.verify(token);
    await this.usersService.removeRefreshToken(payload.sub);
  }
}
