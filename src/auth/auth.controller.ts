import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { CreateUserDto } from '../users/dto/user.dto';

interface AuthRequest extends Request {
  cookies: {
    refresh_token?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  async login(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();

    const { accessToken, refreshToken } = await this.authService.login(user);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return { accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: AuthRequest) {
    const token = req.cookies?.refresh_token;
    return this.authService.refresh(token);
  }

  @Post('logout')
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token;
    await this.authService.logout(token);
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }
}
