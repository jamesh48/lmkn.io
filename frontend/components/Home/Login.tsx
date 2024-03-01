import { Close, Label } from '@mui/icons-material';
import {
  Box,
  Dialog,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import { Form, Formik } from 'formik';

interface LoginProps {
  open: boolean;
  handleLoginView: (flag: boolean, success?: boolean) => void;
}
const Login = (props: LoginProps) => {
  return (
    <Dialog open={props.open}>
      <Formik
        onSubmit={async (values, formikHelpers) => {
          try {
            const { data } = await axios({
              url: '/api/userLogin',
              method: 'POST',
              data: {
                userId: values.userId,
                userPassword: values.userPassword,
              },
            });
            if (data.result === true) {
              props.handleLoginView(false, true);
            }
            return 'ok';
          } catch (err) {
            const typedErr = err as AxiosError<{ result: boolean }>;
            if (typedErr.response?.data.result === false) {
              formikHelpers.setErrors({ userPassword: 'Invalid Password' });
            }
          }
        }}
        initialValues={{
          userId: '',
          userPassword: '',
        }}
      >
        {({ values, handleChange, errors, isSubmitting }) => (
          <Box>
            <Box sx={{ display: 'flex' }}>
              <Typography
                variant="h5"
                sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}
              >
                Login
              </Typography>
              <Close
                sx={{ cursor: 'pointer' }}
                onClick={() => props.handleLoginView(false)}
              />
            </Box>
            <Form>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <InputLabel>User Name</InputLabel>
                <OutlinedInput
                  name="userId"
                  value={values.userId}
                  onChange={handleChange}
                />
                <InputLabel>User Password</InputLabel>
                <OutlinedInput
                  name="userPassword"
                  value={values.userPassword}
                  onChange={handleChange}
                  type="password"
                />
                {errors.userPassword ? (
                  <Typography sx={{ color: 'red' }}>
                    {errors.userPassword}
                  </Typography>
                ) : null}
              </Box>
              <OutlinedInput
                fullWidth
                type="submit"
                value="Login"
                disabled={isSubmitting}
                inputProps={{ sx: { cursor: 'pointer' } }}
              />
            </Form>
          </Box>
        )}
      </Formik>
    </Dialog>
  );
};

export default Login;
