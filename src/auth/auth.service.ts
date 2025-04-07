import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from './dto/auth.dto';


@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private jwtService: JwtService) { }

  async login(email: string, password: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException("Invalid email or password");
      }
      const payload = { email: user.email, sub: user.id };
      const accessToken =  this.jwtService.sign(payload) 
      return accessToken ;
     
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new ConflictException("An error occurred during login");

      }
    }
  }

  async register({ email, password }: AuthDto): Promise<String> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser)
        throw new ConflictException("Email is already registered");
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync());
      await this.prisma.user.create({
        data: { email, password: hashedPassword, biometricKey: 'biometric7' },
      });

      return "Registration successful! Please login with your email and password.";
    } catch (error) {
        throw error;
    }
  }

  async biometricLogin(biometricKey: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { biometricKey },
      });
      if (!user) {
        throw new Error('User not found');
      }
      const payload = { email: user.email, sub: user.id };
      const accessToken =  this.jwtService.sign(payload) 
      return accessToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new ConflictException("An error occurred during biometric login");
      }
    }

  }
}

