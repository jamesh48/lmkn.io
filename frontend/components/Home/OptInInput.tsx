import { Box, OutlinedInput, Typography } from '@mui/material';
import { FormikErrors } from 'formik';

interface OptInInputProps {
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
}

const OptInInput = (props: OptInInputProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        padding: '.5rem',
        marginY: '.5rem',
        border: '1px solid lightgray',
        borderRadius: '5px',
      }}
    >
      <Typography>Opt In To Receive Text Messages?</Typography>
      <OutlinedInput
        onClick={() => props.setFieldValue('optedIn', true)}
        type="button"
        value="yes"
        sx={{
          bgcolor: 'green',
          color: 'white',
          width: '5rem',
          height: '2rem',
          ml: '1rem',
        }}
        inputProps={{ sx: { cursor: 'pointer' } }}
      />
    </Box>
  );
};

export default OptInInput;
