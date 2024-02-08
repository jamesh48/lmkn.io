import { Box, Dialog, OutlinedInput, Typography } from '@mui/material';
import PinModal from './PinModal';
import { Close } from '@mui/icons-material';
import { useState } from 'react';
import DeleteUserModal from './DeleteUserModal';

interface UserPreferencesProps {
  handleUserPreferencesOpen: (flag: boolean) => void;
  userPreferencesOpen: boolean;
  userId: string;
}

const UserPreferences = (props: UserPreferencesProps) => {
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);

  const handlePinModalOpen = (flag: boolean) => {
    setPinModalOpen(flag);
  };

  const handleDeleteUserModalOpen = (flag: boolean) => {
    setDeleteUserModalOpen(flag);
  };

  return (
    <Dialog open={props.userPreferencesOpen}>
      <Box sx={{ borderBottom: '1px solid black' }}>
        <Close
          sx={{ cursor: 'pointer' }}
          onClick={() => props.handleUserPreferencesOpen(false)}
        />
      </Box>
      <Box
        sx={{
          paddingY: '1.5rem',
          paddingX: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h6">User Preferences</Typography>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <Box>
            <OutlinedInput
              onClick={() => handlePinModalOpen(true)}
              inputProps={{
                sx: { cursor: 'pointer', textAlign: 'center' },
              }}
              value="Create Pin?"
              type="button"
            />
            <PinModal
              pinModalOpen={pinModalOpen}
              handlePinModalOpen={handlePinModalOpen}
              userId={props.userId}
            />
          </Box>
          <Box>
            <OutlinedInput
              value="Delete User?"
              inputProps={{ sx: { textAlign: 'center', cursor: 'pointer' } }}
              type="button"
              onClick={() => handleDeleteUserModalOpen(true)}
            />
            <DeleteUserModal
              deleteUserModalOpen={deleteUserModalOpen}
              handleDeleteUserModalOpen={handleDeleteUserModalOpen}
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default UserPreferences;
