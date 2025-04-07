import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { AuthDto } from '../dto/auth.dto';
import { PrismaService } from '../../prisma/prisma.service';

// Create mock implementations
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
};

const mockJwtService = {
  sign: jest.fn()
};

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(),
  compare: jest.fn(),
  genSaltSync: jest.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    // Reset all mocks between tests
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: AuthDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashed-password';
      const salt = 'salt';

      // Set up mock return values
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User doesn't exist yet
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: hashedPassword,
        biometricKey: expect.any(String), 
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock bcrypt functions
      (bcrypt.genSaltSync as jest.MockedFunction<typeof bcrypt.genSaltSync>).mockReturnValue(salt);
      (bcrypt.hashSync as jest.MockedFunction<typeof bcrypt.hashSync>).mockReturnValue(hashedPassword);

      const result = await authService.register(registerDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(registerDto.password, salt);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          biometricKey: expect.any(String), 
        },
      });
      expect(result).toBe('Registration successful! Please login with your email and password.');
    });

    it('should throw ConflictException if email is already registered', async () => {
      const registerDto: AuthDto = { email: 'existing@example.com', password: 'password123' };
      
      // Set up mock to return an existing user
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: 'existing-password',
        biometricKey: 'biometric7',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(authService.register(registerDto))
        .rejects.toThrowError(ConflictException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { 
        id: 1, 
        email, 
        password: 'hashed-password',
        biometricKey: 'biometric7',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const token = 'jwt-token';

      // Set up mock return values
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);

      const result = await authService.login(email, password);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
      expect(result).toBe(token);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      // Set up mock return value for non-existent user
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(email, password))
        .rejects.toThrow(UnauthorizedException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = { 
        id: 1,
        email, 
        password: 'hashed-password',
        biometricKey: 'biometric7',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Set up mock return values
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockResolvedValue(false as never);

      await expect(authService.login(email, password))
        .rejects.toThrow(UnauthorizedException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors during login', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      // Set up mock to throw an error
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(authService.login(email, password))
        .rejects.toThrow(ConflictException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('biometricLogin', () => {
    it('should return a JWT token for valid biometric key', async () => {
      const biometricKey = 'biometric7';
      const user = { 
        id: 1, 
        email: 'test@example.com', 
        biometricKey,
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const token = 'jwt-token';

      // Set up mock return values
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      const result = await authService.biometricLogin(biometricKey);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { biometricKey } });
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
      expect(result).toBe(token);
    });

    it('should throw ConflictException for invalid biometric key', async () => {
      const biometricKey = 'invalid-key';

      // Set up mock return value for non-existent user
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.biometricLogin(biometricKey))
        .rejects.toThrow(ConflictException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { biometricKey } });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors during biometric login', async () => {
      const biometricKey = 'biometric7';
      
      // Set up mock to throw an error
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(authService.biometricLogin(biometricKey))
        .rejects.toThrow(ConflictException);
      
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { biometricKey } });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});