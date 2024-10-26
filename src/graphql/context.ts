import type { YogaInitialContext } from 'graphql-yoga';
import type { User } from '~/db/schema';
import { authenticateUser } from '~/graphql/auth';

export type GraphQLContext = {
  currentUser: User | null;
};

export async function createContext(
  initialContext: YogaInitialContext,
): Promise<GraphQLContext> {
  return {
    currentUser: await authenticateUser(initialContext.request),
  };
}
