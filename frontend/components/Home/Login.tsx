import { Close, Label } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
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
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'flex-end',
          borderBottom: '1px solid black',
        }}
      >
        <Close
          sx={{ cursor: 'pointer' }}
          onClick={() => props.handleLoginView(false)}
        />
      </Box>
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
          <Box
            sx={{
              width: '25rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              paddingX: '1rem',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
              }}
            >
              <Typography variant="h5">Login</Typography>
            </Box>
            <Form style={{ width: '25rem' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    marginY: '.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <InputLabel>User Name</InputLabel>
                  <OutlinedInput
                    name="userId"
                    value={values.userId}
                    onChange={handleChange}
                    sx={{ width: '100%' }}
                  />
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    marginY: '.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <InputLabel>User Password</InputLabel>
                  <OutlinedInput
                    name="userPassword"
                    value={values.userPassword}
                    onChange={handleChange}
                    type="password"
                    sx={{ width: '100%' }}
                  />
                </Box>
                {errors.userPassword ? (
                  <Typography sx={{ color: 'red' }}>
                    {errors.userPassword}
                  </Typography>
                ) : null}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '5rem',
                  alignItems: 'center',
                }}
              >
                {isSubmitting ? (
                  <CircularProgress />
                ) : (
                  <OutlinedInput
                    type="submit"
                    value="Login"
                    disabled={isSubmitting}
                    inputProps={{ sx: { cursor: 'pointer' } }}
                    sx={{
                      width: '10rem',
                    }}
                  />
                )}
              </Box>
            </Form>
          </Box>
        )}
      </Formik>
    </Dialog>
  );
};

export default Login;
