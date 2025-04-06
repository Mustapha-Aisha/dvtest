import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
    @Query(() => String)
    async hello() {
      return 'Hello World from GraphQL!';
    }
}
