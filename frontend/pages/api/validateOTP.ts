import { NextApiRequest, NextApiResponse } from 'next';
import router from '../../api-libs/base';
import axios from 'axios';

export default router
  .clone()
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.body);

    const { data } = await axios({
      method: 'POST',
      url: `${process.env.AUTH_ENDPOINT}/validate`,
      data: { code: req.body.code, userPhone: req.body.userPhone },
      headers: { 'Content-Type': 'application/json' },
    });

    // data.message == 'Success'
    return res.send('ok');
  })
  .handler();
