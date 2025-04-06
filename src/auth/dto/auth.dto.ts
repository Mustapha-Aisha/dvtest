import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    @Field()
    email: string;
  
    @IsString()
    @IsNotEmpty()
    @Field()
    password: string;
}

@InputType()
export class BiometricLoginDto {
    @IsString()
    @IsNotEmpty()
    @Field()
    biometricKey: string;
}