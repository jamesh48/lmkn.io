import { Box, OutlinedInput, Typography } from '@mui/material';

interface PasswordInputProps {
  handleChange: (e: React.ChangeEvent<any>) => void;
  passwordOne: string;
  passwordTwo: string;
  passwordOneErrors?: string;
}

const PasswordInput = (props: PasswordInputProps) => {
  return (
    <Box
      sx={{
        marginY: '.5rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
          }}
        >
          <OutlinedInput
            name="passwordOne"
            value={props.passwordOne}
            onChange={props.handleChange}
            placeholder="enter password"
            type="password"
            sx={{ flex: 1, marginRight: '.25rem' }}
          />
          {props.passwordTwo ||
          props.passwordOneErrors === 'passwords do not match' ? (
            <OutlinedInput
              name="passwordTwo"
              value={props.passwordTwo}
              onChange={props.handleChange}
              placeholder="confirm password"
              type="password"
              sx={{ flex: 1, marginLeft: '.25rem' }}
            />
          ) : null}
        </Box>
      </Box>
      <Typography
        color={props.passwordOneErrors === 'Passwords Match!' ? 'green' : 'red'}
      >
        {props.passwordOneErrors && props.passwordOneErrors}
      </Typography>
    </Box>
  );
};

export default PasswordInput;
