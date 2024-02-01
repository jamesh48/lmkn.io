import { Box, Dialog, Typography } from '@mui/material';
import PinModal from './PinModal';
import { Close } from '@mui/icons-material';
import { useState } from 'react';

interface UserPreferencesProps {
  handleUserPreferencesOpen: (flag: boolean) => void;
  userPreferencesOpen: boolean;
  userId: string;
}

const UserPreferences = (props: UserPreferencesProps) => {
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const handlePinModalOpen = (flag: boolean) => {
    setPinModalOpen(flag);
  };
  return (
    <Dialog open={props.userPreferencesOpen}>
      <Close
        sx={{ cursor: 'pointer' }}
        onClick={() => props.handleUserPreferencesOpen(false)}
      />
      <Box sx={{ padding: '2.5rem' }}>
        <Box>
          <Typography>User Preferences</Typography>
        </Box>
        <Box>
          <Typography
            onClick={() => handlePinModalOpen(true)}
            sx={{ cursor: 'pointer' }}
          >
            Create Pin?
          </Typography>
          <PinModal
            pinModalOpen={pinModalOpen}
            handlePinModalOpen={handlePinModalOpen}
            userId={props.userId}
          />
        </Box>
        <Box>
          <Typography>Delete User?</Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default UserPreferences;
