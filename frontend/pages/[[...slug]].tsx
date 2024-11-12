import SendMsg from '@/components/SendMsg/Index';
import Home from '@/components/Home/Index';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import GlobalStore from '@/redux/store';
import { appInitialState } from '@/redux/slices/appSlice';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { createRouter } from 'next-connect';

export const ncRouter = createRouter<NextApiRequest, NextApiResponse>().get(
  async (req) => {
    const userId = req.query.slug as string[];
    // Return Home Page
    if (!userId || !userId.length) {
      return { props: {} };
    }
    const { data: response } = await axios({
      method: 'GET',
      params: { userId: userId[0] },
      url: 'http://localhost:3000/api/userExists',
    });

    if (response.success === false) {
      return {
        props: {
          errorMessage: response.message,
        },
      };
    }

    // Return User Page
    return {
      props: { userId: userId[0], userHasPin: !!response.data.pin },
    };
  }
);

export const getServerSideProps = (ctx: GetServerSidePropsContext) => {
  const newReq = {
    ...ctx.req,
    query: ctx.query,
  };
  return ncRouter.run(newReq as NextApiRequest, ctx.res as NextApiResponse);
};

interface MainProps {
  userId?: string;
  errorMessage?: string;
  userHasPin: boolean;
}
const queryClient = new QueryClient();
const Main = (props: MainProps) => {
  return (
    <Provider
      store={GlobalStore.prototype.configureGlobalStore({
        app: {
          ...appInitialState,
        },
      })}
    >
      <QueryClientProvider client={queryClient}>
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {props.userId ? (
            <SendMsg userId={props.userId} userHasPin={props.userHasPin} />
          ) : (
            <Home errorMessage={props.errorMessage} />
          )}
        </Box>
      </QueryClientProvider>
    </Provider>
  );
};

export default Main;
