import { Label } from '@mui/icons-material';
import {
  Box,
  Dialog,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Form, Formik } from 'formik';

interface LoginProps {
  open: boolean;
}
const Login = (props: LoginProps) => {
  return (
    <Dialog open={props.open}>
      <Formik
        onSubmit={async (values) => {
          await axios({
            url: '/api/userLogin',
            method: 'POST',
            data: {
              userName: values.userName,
              userPassword: values.userPassword,
            },
          });
        }}
        initialValues={{
          userName: '',
          userPassword: '',
        }}
      >
        {({ values, handleChange }) => (
          <Box>
            <Box>
              <Typography>Login</Typography>
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
                  name="userName"
                  value={values.userName}
                  onChange={handleChange}
                />
                <InputLabel>User Password</InputLabel>
                <OutlinedInput
                  name="userPassword"
                  value={values.userPassword}
                  onChange={handleChange}
                />
              </Box>
              <OutlinedInput
                fullWidth
                type="submit"
                value="Login"
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
