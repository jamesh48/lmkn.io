import axios from 'axios';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { router, userExists } from '../../api-libs';

export default router
  .clone()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.query.userId as string;
    const userPhone = req.query.userPhone as string;
    const userPassword = req.query.userPassword as string;

    const result = await userExists(userId);
    if (result.success === true) {
      // If so, return error
      return res
        .status(400)
        .json({ error: 'User Already Exists', success: false });
    } else {
      if (!process.env.SALT) {
        throw new Error('ENV SALT is not defined!');
      }

      const hashedPassword = await bcrypt.hash(userPassword, process.env.SALT);
      // If not, create user
      const { data } = await axios({
        method: 'POST',
        url: `${process.env.AUTH_ENDPOINT}/auth-code`,
        data: { userPassword: hashedPassword, userId, userPhone },
        headers: { 'Content-Type': 'application/json' },
      });

      const session = await getIronSession<{ userId: string }>(req, res, {
        cookieName: 'userId',
        password: process.env.IRON_SESSION_PWD!,
      });
      session.userId = userId;
      await session.save();

      res.send({ success: true });
    }
  })
  .handler();
