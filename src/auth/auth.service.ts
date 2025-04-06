import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from './dto/auth.dto';
import { BaseResponse } from 'src/util/BaseResponse.entity';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private jwtService: JwtService) { }

  async login(email: string, password: string): Promise<BaseResponse> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException("Invalid email or password");
      }
      const payload = { email: user.email, sub: user.id };
      return {
        status: "success",
        message: "Login successful",
        data: { accessToken: this.jwtService.sign(payload) }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new ConflictException("An error occurred during login");

      }
    }
  }

  async register({ email, password }: AuthDto): Promise<BaseResponse> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser)
        throw new ConflictException("Email is already registered");
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync());
      await this.prisma.user.create({
        data: { email, password: hashedPassword, biometricKey: 'biometric' },
      });

      return {
        status: "success",
        message:
          "Registration successful! Please login with your email and password.",
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new ConflictException("An error occurred during registration");

      }
    }
  }

  async biometricLogin(biometricKey: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { biometricKey },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new ConflictException("An error occurred during biometric login");
      }
    }

  }
}

