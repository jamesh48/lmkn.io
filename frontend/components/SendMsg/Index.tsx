import { Box, Button, TextField, Typography } from '@mui/material';
import PinPopup from './PinPopup';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

interface SendMsgProps {
  userId: string;
  userHasPin: boolean;
}
const SendMsg = (props: SendMsgProps) => {
  const [pinPopupOpen, setPinModalOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const handlePinPopupOpen = (flag: boolean) => {
    setPinModalOpen(flag);
  };

  const handleSendMessage = async () => {
    setMsg('');
    await axios({
      url: '/api/sendMsg',
      method: 'POST',
      data: { message: msg, userId: props.userId },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const inputRef = useRef<HTMLElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

        <TextField
          multiline
          rows={10}
          fullWidth
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          sx={{ marginY: '.5rem' }}
          inputRef={inputRef}
        />
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
              if (props.userHasPin) {
                handlePinPopupOpen(true);
              } else {
                // Send Message Endpoint
                handleSendMessage();
              }
            }}
          >
            Send!
          </Button>
        </Box>
        <PinPopup
          pinPopupOpen={pinPopupOpen}
          handlePinPopupOpen={handlePinPopupOpen}
          handleSendMessage={handleSendMessage}
        />
      </Box>
    </Box>
  );
};

export default SendMsg;
