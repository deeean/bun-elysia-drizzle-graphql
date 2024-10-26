import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { GraphQLDateTime } from 'graphql-scalars';

export const UserObjectType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    username: {
      type: new GraphQLNonNull(GraphQLString),
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
    updatedAt: {
      type: new GraphQLNonNull(GraphQLDateTime),
    },
  },
});
