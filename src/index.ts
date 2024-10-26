import 'dotenv/config';
import Elysia from 'elysia';
import { eq } from 'drizzle-orm';
import {
  GraphQLError,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import yoga from '@elysiajs/graphql-yoga';
import type { YogaInitialContext } from 'graphql-yoga';
import { sign } from 'jsonwebtoken';
import { db } from '~/db';
import { UserObjectType } from '~/graphql/schema';
import { createContext, type GraphQLContext } from '~/graphql/context';
import { users } from '~/db/schema';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      me: {
        type: new GraphQLNonNull(UserObjectType),
        resolve: async (_, __, context: GraphQLContext) => {
          if (!context.currentUser) {
            throw new GraphQLError('Unauthorized');
          }

          return context.currentUser;
        },
      },
      ping: {
        type: new GraphQLNonNull(GraphQLString),
        resolve: () => 'pong',
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      register: {
        type: new GraphQLNonNull(UserObjectType),
        args: {
          username: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (
          _,
          {
            username,
            password,
          }: {
            username: string;
            password: string;
          },
        ) => {
          const usernameExists = await db.query.users.findFirst({
            columns: {
              id: true,
            },
            where: eq(users.username, username),
          });

          if (usernameExists) {
            throw new GraphQLError('Username already exists');
          }

          const hashedPassword = await Bun.password.hash(password);

          const results = await db
            .insert(users)
            .values({
              username,
              password: hashedPassword,
            })
            .returning();

          return results[0];
        },
      },
      login: {
        type: new GraphQLNonNull(GraphQLString),
        args: {
          username: { type: GraphQLString },
          password: { type: GraphQLString },
        },
        resolve: async (_, { username, password }) => {
          const user = await db.query.users.findFirst({
            where: eq(users.username, username),
          });

          if (!user) {
            throw new GraphQLError('Invalid username or password');
          }

          const valid = await Bun.password.verify(password, user.password);

          if (!valid) {
            throw new GraphQLError('Invalid username or password');
          }

          return sign({ userId: user.id }, process.env.JWT_SECRET!);
        },
      },
    },
  }),
});

const app = new Elysia()
  .use(
    yoga({
      schema,
      // @elysia/graphql-yoga context type different from graphql-yoga
      // @ts-ignore
      context(initialContext: YogaInitialContext) {
        return createContext(initialContext);
      },
    }),
  )
  .listen(3000);
