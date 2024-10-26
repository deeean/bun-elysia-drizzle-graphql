import { eq } from 'drizzle-orm';
import { type JwtPayload, verify } from 'jsonwebtoken';
import { db } from '~/db';
import { users } from '~/db/schema';

export async function authenticateUser(request: Request) {
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return null;
  }

  const partsOfTokens = authorization.split(' ');
  if (partsOfTokens.length !== 2 || partsOfTokens[0] !== 'Bearer') {
    return null;
  }

  const [, token] = partsOfTokens;

  const payload = verify(token, process.env.JWT_SECRET!) as JwtPayload;
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  });

  return user ?? null;
}
