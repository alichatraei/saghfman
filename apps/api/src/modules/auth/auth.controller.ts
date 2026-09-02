import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthTokensDto, AuthUserDto, RequestOtpResponse } from '@saghf/types';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

const REFRESH_COOKIE = 'saghf_rt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('request-otp')
  @HttpCode(200)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @ApiOperation({ summary: 'ارسال کد یکبار مصرف به شماره موبایل' })
  requestOtp(@Body() dto: RequestOtpDto, @Req() req: Request): Promise<RequestOtpResponse> {
    return this.auth.requestOtp(dto.phone, { ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Post('verify-otp')
  @HttpCode(200)
  @Throttle({ default: { limit: 12, ttl: 60_000 } })
  @ApiOperation({ summary: 'تأیید کد و ورود به حساب' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    const { tokens, refreshToken } = await this.auth.verifyOtp(dto.phone, dto.code, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    this.setRefreshCookie(res, refreshToken);
    return tokens;
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'تمدید توکن دسترسی' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    const cookie = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    const { tokens, refreshToken } = await this.auth.refresh(cookie, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    this.setRefreshCookie(res, refreshToken);
    return tokens;
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'خروج از حساب کاربری' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const cookie = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    await this.auth.logout(cookie);
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'اطلاعات کاربر جاری' })
  async me(@CurrentUser() user: RequestUser): Promise<AuthUserDto> {
    const record = await this.prisma.user.findFirstOrThrow({ where: { id: user.id } });
    return this.auth.toAuthUser(record);
  }

  private setRefreshCookie(res: Response, token: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 3600 * 1000,
    });
  }
}
