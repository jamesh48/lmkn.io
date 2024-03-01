import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';
import axios from 'axios';

export default router
  .clone()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const userPassword = req.body.userPassword;
    const userName = req.body.userName;
    return res.send('ok');
  })
  .handler();
