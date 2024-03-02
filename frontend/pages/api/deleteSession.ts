import { router } from '../../api-libs';
import { getIronSession } from 'iron-session';

export default router
  .clone()
  .post(async (req, res) => {
    const session = await getIronSession(req, res, {
      password: process.env.IRON_SESSION_PWD!,
      cookieName: 'userId',
    });
    session.destroy();
    return res.status(200).send({ message: 'session deleted' });
  })
  .handler();
