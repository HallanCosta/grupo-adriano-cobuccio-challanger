import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { RegisterUser } from '@/modules/auth/application/commands/registerUser.js';
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

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUser) private readonly registerUser: RegisterUser,
  ) {}

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
}
