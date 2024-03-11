import { Box, Link, Typography } from '@mui/material';
import Image from 'next/image';
import UserPreferences from './UserPreferences';
import { useState } from 'react';
import axios from 'axios';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';

interface ExistingUserDetailsProps {
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<any, Error>>;
  loggedInUserProfile: {
    userId: string;
    userPhone: string;
  };
}
const ExistingUserDetails = (props: ExistingUserDetailsProps) => {
  const [userPreferencesOpen, setUserPreferencesOpen] = useState(false);
  const handleUserPreferencesOpen = (flag: boolean) => {
    setUserPreferencesOpen(flag);
  };

  const handleLogout = async () => {
    await axios({
      url: '/api/deleteSession',
      method: 'POST',
    });
    await props.refetch();
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        height: '90%',
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
          Unique Identifier: www.lmkn.io/{props.loggedInUserProfile.userId}
        </Typography>
        <Typography variant="h5">
          Contact Phone Number: {props.loggedInUserProfile.userPhone}
        </Typography>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', paddingY: '1rem' }}
        >
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?data=https://localhost:3000/${props.loggedInUserProfile.userId}&size=250x250`}
            alt="qr-code"
            width={250}
            height={250}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography
            sx={{ cursor: 'pointer' }}
            onClick={() => handleUserPreferencesOpen(true)}
            variant="h5"
          >
            User Preferences
          </Typography>
        </Box>
        <UserPreferences
          userPreferencesOpen={userPreferencesOpen}
          handleUserPreferencesOpen={handleUserPreferencesOpen}
          userId={props.loggedInUserProfile.userId}
        />
        <Link
          sx={{
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handleLogout}
        >
          <Typography sx={{ cursor: 'pointer' }}>Logout</Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default ExistingUserDetails;
