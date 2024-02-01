import { Box, Button, TextField, Typography } from '@mui/material';
import PinPopup from './PinPopup';
import { useState } from 'react';

interface SendMsgProps {
  userId: string;
  pin: boolean;
}
const SendMsg = (props: SendMsgProps) => {
  const [pinPopupOpen, setPinModalOpen] = useState(false);
  const handlePinPopupOpen = (flag: boolean) => {
    setPinModalOpen(flag);
  };

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          border: '1px solid black',
          height: '35%',
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flex: 0.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5">Send Message to /{props.userId}</Typography>
        </Box>
        <Box
          sx={{
            flex: 0.5,
            width: '75%',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <TextField multiline rows={10} fullWidth></TextField>
        </Box>
        <Box
          sx={{
            flex: 0.25,

            display: 'flex',

            alignItems: 'center',
          }}
        >
          <Button
            sx={{ color: 'white', bgcolor: 'green' }}
            onClick={() => {
              if (props.pin) {
                handlePinPopupOpen(true);
              } else {
                // Send Message Endpoint
              }
            }}
          >
            Send!
          </Button>
        </Box>
        <PinPopup
          pinPopupOpen={pinPopupOpen}
          handlePinPopupOpen={handlePinPopupOpen}
        />
      </Box>
    </Box>
  );
};

export default SendMsg;
