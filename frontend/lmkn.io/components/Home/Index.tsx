import { useEffect, useState } from 'react';
import { Box, OutlinedInput, Typography } from '@mui/material';
import NewUserForm from './NewUserForm';
import axios from 'axios';

interface HomeProps {
  errorMessage?: string;
}
const Home = (props: HomeProps) => {
  const [loggedInUserProfile, setLoggedInUserProfile] = useState({
    userId: '',
    userPhone: '',
  });
  useEffect(() => {
    const fetchIsLoggedInUser = async () => {
      try {
        const { data } = await axios({
          url: '/api/isLoggedInUser',
          withCredentials: true,
        });
        if (data.success) {
          setLoggedInUserProfile(data.data);
        }
      } catch (err) {}
    };
    fetchIsLoggedInUser();
  }, []);

  if (props.errorMessage) {
    return <Box>{props.errorMessage}</Box>;
  }

  if (loggedInUserProfile.userId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography sx={{ textDecoration: 'underline' }} variant="h3">
          Your Contact Info
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Typography variant="h5">
            Unique Identifier: /{loggedInUserProfile.userId}
          </Typography>
          <Typography variant="h5">
            Contact Phone Number: {loggedInUserProfile.userPhone}
          </Typography>
        </Box>
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <NewUserForm />
    </Box>
  );
};

export default Home;
