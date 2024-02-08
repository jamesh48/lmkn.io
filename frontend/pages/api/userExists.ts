import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';
import { userExists } from '@/api-libs/userExists';

export default router
  .clone()
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.query.userId as string;
    const result = await userExists(userId);
    return res.send(result);
  })
  .handler();
