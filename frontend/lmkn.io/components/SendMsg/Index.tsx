import { Box, Button, TextField, Typography } from '@mui/material';

interface SendMsgProps {
  userId: string;
}
const SendMsg = (props: SendMsgProps) => {
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
          <Typography variant="h5">Send Message to {props.userId}</Typography>
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
          <Button sx={{ color: 'white', bgcolor: 'green' }}>Send!</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SendMsg;
