import { Box, OutlinedInput, Typography } from '@mui/material';
import { Ref } from 'react';

interface UserIdInputProps {
  handleChange: (e: React.ChangeEvent<any>) => void;
  userId: string;
  userIdMessage: string;
  inputRef: Ref<HTMLInputElement>;
}

const UserIdInput = (props: UserIdInputProps) => {
  return (
    <Box sx={{ width: '25rem', marginY: '.5rem' }}>
      <Box sx={{ width: '100%' }}>
        <OutlinedInput
          fullWidth
          placeholder="Unique User ID"
          name="userId"
          onChange={props.handleChange}
          value={props.userId}
          inputProps={{ ref: props.inputRef }}
          // sx={{ width: '100%' }}
        />
      </Box>
      <Typography
        sx={{
          color:
            props.userIdMessage.startsWith('Validating') ||
            props.userIdMessage === 'User Identifier is Available!'
              ? 'green'
              : 'red',
        }}
      >
        {props.userIdMessage}
      </Typography>
    </Box>
  );
};

export default UserIdInput;
