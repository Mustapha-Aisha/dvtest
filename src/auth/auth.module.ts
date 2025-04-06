import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
    imports: [
      PrismaModule,
      PassportModule,
      JwtModule.registerAsync({
        useFactory: () => ({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      }),
    ],
    providers: [AuthService, AuthResolver, JwtStrategy], 
    exports: [AuthService],
  })
  export class AuthModule {}
