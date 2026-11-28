import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { Authenticate } from '@/modules/auth/application/commands/authenticate.js';
import { RegisterUser } from '@/modules/auth/application/commands/registerUser.js';
import { GetCurrentUser } from '@/modules/auth/application/queries/getCurrentUser.js';
import { Public } from '@/shared/infra/http/public.js';
import type { AuthenticatedUser } from './authenticatedRequest.js';
import { CurrentUser } from './currentUser.js';
import {
  type LoginRequest,
  loginRequestSchema,
} from './requests/loginRequest.js';
import {
  type RegisterRequest,
  registerRequestSchema,
} from './requests/registerRequest.js';

export type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: { id: string; name: string; email: string };
};

export type MeResponse = RegisterResponse;

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUser) private readonly registerUser: RegisterUser,
    @Inject(Authenticate) private readonly authenticate: Authenticate,
    @Inject(GetCurrentUser) private readonly getCurrentUser: GetCurrentUser,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body({ schema: registerRequestSchema }) body: RegisterRequest,
  ): Promise<RegisterResponse> {
    const user = await this.registerUser.execute(body);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body({ schema: loginRequestSchema }) body: LoginRequest,
  ): Promise<LoginResponse> {
    const session = await this.authenticate.execute(body);

    return {
      accessToken: session.accessToken,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn,
      user: session.user,
    };
  }

  @Get('me')
  async me(@CurrentUser() current: AuthenticatedUser): Promise<MeResponse> {
    const user = await this.getCurrentUser.execute(current.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
