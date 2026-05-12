import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import { prisma } from '../config/prisma.js';

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { user_id: session.user.id },
    });

    req.user = session.user;
    req.profile = profile;
    req.session = session.session;
    next();
  } catch (err) {
    next(err);
  }
}

export default requireAuth;
