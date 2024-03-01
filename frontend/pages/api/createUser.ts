import axios from 'axios';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { userExists } from '@/api-libs/userExists';
import router from '../../api-libs/base';

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

      console.log(data);

      // Then set cookie on browser for persistence.
      const futureDate = new Date(
        new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000
      ); // 10 years from now
      res.setHeader(
        'Set-Cookie',
        `userId=${userId}; HttpOnly;Expires=${futureDate.toUTCString()}`
      );

      res.send({ success: true });
    }
  })
  .handler();
