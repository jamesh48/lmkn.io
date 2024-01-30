import SendMsg from '@/components/SendMsg/Index';
import Home from '@/components/Home/Index';
import { Box } from '@mui/material';
import { Provider } from 'react-redux';
import { NextApiRequest } from 'next';
import GlobalStore from '@/redux/store';
import { appInitialState } from '@/redux/slices/appSlice';
import axios from 'axios';

export const getServerSideProps = async (req: NextApiRequest) => {
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
    props: { userId },
  };
};

interface MainProps {
  userId?: string;
  errorMessage?: string;
}
const Main = (props: MainProps) => {
  return (
    <Provider
      store={GlobalStore.prototype.configureGlobalStore({
        app: {
          ...appInitialState,
        },
      })}
    >
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
          <SendMsg userId={props.userId} />
        ) : (
          <Home errorMessage={props.errorMessage} />
        )}
      </Box>
    </Provider>
  );
};

export default Main;
