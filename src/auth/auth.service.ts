import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AuthDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private jwtService: JwtService) { }

  /**
   * Authenticates a user using email and password.
   * @param email - User's email
   * @param password - User's password
   * @returns JWT access token if successful
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(email: string, password: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      // Check if user exists and password is valid
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException("Invalid email or password");
      }

      // Prepare JWT payload and sign token
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


  /**
   * Registers a new user with email and password.
   * @param AuthDto - DTO containing email and password
   * @returns Confirmation message on successful registration
   * @throws ConflictException if email already exists or on DB errors
   */
  async register({ email, password }: AuthDto): Promise<String> {
    try {
      const uniqueBiometricKey = uuidv4(); 
       
      // Check for duplicate user
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser)
        throw new ConflictException("Email is already registered");

        // Hash password before saving to DB
      const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync());
      await this.prisma.user.create({
        data: { email, password: hashedPassword, biometricKey: uniqueBiometricKey },
      });

      return "Registration successful! Please login with your email and password.";
    } catch (error) {
        throw error;
    }
  }

    /**
   * Authenticates a user using biometric key.
   * @param biometricKey - Unique biometric identifier (e.g., fingerprint token)
   * @returns JWT access token if successful
   * @throws ConflictException if user not found or other unexpected errors
   */
  async biometricLogin(biometricKey: string): Promise<string> {
    try {
      // Find user by biometricKey
      const user = await this.prisma.user.findUnique({
        where: { biometricKey },
      });
      if (!user) {
        throw new Error('User not found');
      }

      // Issue JWT based on biometric authentication
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

