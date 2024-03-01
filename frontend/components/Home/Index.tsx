import { useEffect, useState } from 'react';
import { Box, OutlinedInput, Typography } from '@mui/material';
import NewUserForm from './NewUserForm';
import axios from 'axios';
import ExistingUserDetails from './ExistingUserDetails';
import { useQuery } from '@tanstack/react-query';

interface HomeProps {
  errorMessage?: string;
}

const Home = (props: HomeProps) => {
  const {
    data: loggedInUserProfile,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['loggedInUser'],
    queryFn: () =>
      axios({
        url: '/api/isLoggedInUser',
        method: 'GET',
        withCredentials: true,
      })
        .then((res) => res.data.data)
        .catch((err) => {}),
  });

  if (isPending) {
    return (
      <Box>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (props.errorMessage) {
    return <Box>{props.errorMessage}</Box>;
  }

  if (loggedInUserProfile?.userId) {
    return <ExistingUserDetails loggedInUserProfile={loggedInUserProfile} />;
  }

  return <NewUserForm refetch={refetch} />;
};

export default Home;
