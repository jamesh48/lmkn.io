import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';
import axios from 'axios';
import { userExists } from '@/api-libs/userExists';

export default router
  .clone()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await userExists(req.body.userId);
    const userPhone = user.data?.userPhone;

    if (!userPhone) {
      return res.status(404).send({ error: 'User not Found' });
    }

    await axios({
      method: 'POST',
      url: `${process.env.AUTH_ENDPOINT}/sendMsg`,
      data: { message: req.body.message, userPhone: userPhone },
      headers: { 'Content-Type': 'application/json' },
    });
    return res.send({ message: 'ok' });
  })
  .handler();
