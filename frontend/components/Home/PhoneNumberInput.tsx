import { Box, OutlinedInput, Typography } from '@mui/material';
import { FormikErrors } from 'formik';

interface PhoneNumberInputProps {
  phone: string;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<{
    phone: string;
    userId: string;
    optedIn: boolean;
    passwordOne: string;
    passwordTwo: string;
  }>>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  phoneErrors?: string;
  isValidating: boolean;
  inputRef: React.Ref<HTMLInputElement>;
}
const PhoneNumberInput = (props: PhoneNumberInputProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <OutlinedInput
          placeholder="Your Phone Number"
          fullWidth
          name="phone"
          value={props.phone}
          onChange={props.handleChange}
          disabled={props.phone.length === 12 && props.isValidating}
          inputRef={props.inputRef}
        />

        <OutlinedInput
          value="opt out?"
          type="button"
          onClick={() => {
            props.setFieldValue('phone', '');
            props.setFieldValue('optedIn', false);
            props.setFieldValue('passwordOne', '');
            props.setFieldValue('passwordTwo', '');
          }}
          sx={{
            backgroundColor: 'red',
            color: 'white',
            width: '5rem',
            height: '2rem',
            ml: '1rem',
          }}
          inputProps={{ sx: { cursor: 'pointer' } }}
        />
      </Box>
      <Typography
        sx={{
          color:
            props.phoneErrors &&
            ['Validating...', 'Phone Number is Available!'].includes(
              props.phoneErrors
            )
              ? 'green'
              : 'red',
        }}
      >
        {props.phoneErrors}
      </Typography>
    </Box>
  );
};

export default PhoneNumberInput;
