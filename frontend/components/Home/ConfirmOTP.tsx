import { Box, Dialog, OutlinedInput, Typography } from '@mui/material';
import axios from 'axios';
import { Form, Formik } from 'formik';

const ConfirmOTP = (props: {
  open: boolean;
  userPhone: string;
  handleOpen: (flag: boolean, success?: boolean) => void;
}) => {
  return (
    <Dialog open={props.open}>
      <Formik
        onSubmit={async (values) => {
          await axios({
            url: '/api/validateOTP',
            method: 'POST',
            data: { code: values.otp, userPhone: props.userPhone },
          });
          props.handleOpen(false, true);
        }}
        initialValues={{ otp: '' }}
      >
        {({ values, handleChange }) => (
          <Box>
            <Box>
              <Typography>Confirm OTP</Typography>
            </Box>
            <Form>
              <OutlinedInput
                onChange={handleChange}
                name="otp"
                value={values.otp}
              ></OutlinedInput>
              <OutlinedInput
                fullWidth
                type="submit"
                value="Confirm OTP"
                inputProps={{ sx: { cursor: 'pointer' } }}
              />
            </Form>
          </Box>
        )}
      </Formik>
    </Dialog>
  );
};

export default ConfirmOTP;
