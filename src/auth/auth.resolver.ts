import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthDto, BiometricLoginDto } from './dto/auth.dto';


@Resolver('User')
export class AuthResolver {
  constructor(private userService: AuthService) {}

  @Mutation(() => String)
  async register(@Args('input') input: AuthDto): Promise<String> {
  return await this.userService.register(input);
  }

  @Mutation(() => String)
  async login(@Args('input') input: AuthDto): Promise<String>   {
    return await this.userService.login(input.email, input.password);
  
  }

  @Mutation(() => String)
  async biometricLogin(@Args('input') input: BiometricLoginDto): Promise<String>  {
    return await this.userService.biometricLogin(input.biometricKey);
  }

  @Query(() => String)
  ping(): string {
    return 'pong';
  }
}
