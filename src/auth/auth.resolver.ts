import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthDto, BiometricLoginDto } from './dto/auth.dto';

/**
 * AuthResolver handles user authentication-related queries and mutations.
 * This includes user registration, login (via email/password), and biometric login.
 */
@Resolver('User')
export class AuthResolver {
  constructor(private userService: AuthService) {}

  /**
   * Handles user registration.
   * @param input - The input DTO containing email and password.
   * @returns A confirmation message after successful registration.
   */
  @Mutation(() => String)
  async register(@Args('input') input: AuthDto): Promise<String> {
    return await this.userService.register(input);
  }

  /**
   * Handles user login via email and password.
   * @param input - The input DTO containing email and password.
   * @returns A JWT access token if the credentials are valid.
   */
  @Mutation(() => String)
  async login(@Args('input') input: AuthDto): Promise<String> {
    return await this.userService.login(input.email, input.password);
  }

  /**
   * Handles biometric login using a biometric key.
   * @param input - The input DTO containing the biometric key.
   * @returns A JWT access token if the biometric key matches an existing user.
   */
  @Mutation(() => String)
  async biometricLogin(@Args('input') input: BiometricLoginDto): Promise<String> {
    return await this.userService.biometricLogin(input.biometricKey);
  }

  /**
   * A simple health check to test if the GraphQL server is running.
   * @returns A simple 'pong' string.
   */
  @Query(() => String)
  ping(): string {
    return 'pong';
  }
}
