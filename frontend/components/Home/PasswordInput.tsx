import { Box, OutlinedInput, Typography } from '@mui/material';

interface PasswordInputProps {
  handleChange: (e: React.ChangeEvent<any>) => void;
  passwordOne: string;
  passwordTwo: string;
  passwordOneErrors?: string;
}

const PasswordInput = (props: PasswordInputProps) => {
  return (
    <Box>
      <Box>
        <OutlinedInput
          name="passwordOne"
          value={props.passwordOne}
          onChange={props.handleChange}
          placeholder="enter password"
          type="password"
        />
        <OutlinedInput
          name="passwordTwo"
          value={props.passwordTwo}
          onChange={props.handleChange}
          placeholder="confirm password"
          type="password"
        />
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
