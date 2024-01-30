import { useRef, useState } from 'react';
import axios from 'axios';
import { Box, OutlinedInput, Typography } from '@mui/material';
import { Formik, Form } from 'formik';
import debounce from 'lodash/debounce';

const NewUserForm = () => {
  const [userIdError, setUserIdError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const createUser = async (values: { phone: string; userId: string }) => {
    try {
      await axios({
        method: 'POST',
        url: '/api/createUser',
        params: { userId: values.userId, userPhone: values.phone },
      });
    } catch (err) {
      const typedErr = err as {
        response: { data: { error: string; success: boolean } };
      };
      setSubmissionError(typedErr.response.data.error);
    }
  };

  const ref = useRef<HTMLInputElement>();

  const validateUser = async (userId: string) => {
    try {
      const { data } = await axios({
        method: 'GET',
        url: '/api/checkUserName',
        params: { userId: userId },
      });
      return data.success === true
        ? 'User Identifier already exists!'
        : 'User Identifier is Available!';
    } catch (error) {
      console.error('Error checking user:', error);
      return '';
    }
  };

  const debouncedValidateUser = useRef(
    debounce(async (userId: string) => {
      setUserIdError('Validating...'); // Show loading indicator
      const error = await validateUser(userId);
      setUserIdError(error); // Update error message
    }, 500)
  ).current;

  return (
    <Formik
      initialValues={{ phone: '', userId: '', optedIn: false }}
      validate={async (values) => {
        const errors = {} as { phone: string; userId: string };
        if (!values.userId.length) {
          setUserIdError('Required');
        } else if (values.userId.length > 0) {
          debouncedValidateUser(values.userId);
        }

        if (!values.phone.length) {
          errors.phone = 'Required';
        } else if (!values.phone.startsWith('+1')) {
          errors.phone = 'phone number must start with +1';
        } else if (values.phone.length !== 12) {
          errors.phone = 'phone number must be 10 digits long';
        } else if (values.phone.length === 12) {
          const { data } = await axios({
            method: 'GET',
            url: '/api/checkPhoneNumber',
            params: { userPhone: values.phone },
          });
          if (data.success === true) {
            errors.phone = 'Phone Number already exists!';
          }
        }

        if (Object.keys(errors).length) {
          alert(JSON.stringify(errors));
          return errors;
        }

        return {};
      }}
      onSubmit={async (values, { setSubmitting }) => {
        await createUser(values);
        setSubmitting(false);
      }}
    >
      {({
        isSubmitting,
        values,
        handleChange,
        setFieldValue,
        errors,
        isValidating,
      }) => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            border: '1px solid black',
            padding: '1rem',
          }}
        >
          <Typography>{submissionError}</Typography>
          <Form>
            <OutlinedInput
              placeholder="Unique User ID"
              name="userId"
              onChange={handleChange}
              value={values.userId}
              sx={{ width: '100%' }}
            />
            <Typography
              sx={{
                color:
                  userIdError.startsWith('Validating') ||
                  userIdError === 'User Identifier is Available!'
                    ? 'green'
                    : 'red',
              }}
            >
              {userIdError}
            </Typography>
            {values.userId.length && !errors.userId ? (
              !values.optedIn ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    padding: '1rem',
                    border: '1px solid lightgray',
                    borderRadius: '5px',
                  }}
                >
                  <Typography>Opt In To Receive Text Messages?</Typography>
                  <OutlinedInput
                    onClick={() => setFieldValue('optedIn', true)}
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
              ) : (
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
                      value={values.phone}
                      onChange={handleChange}
                      disabled={values.phone.length === 12 && isValidating}
                      autoFocus
                      inputRef={ref}
                      onBlur={() =>
                        setTimeout(() => {
                          ref.current?.focus();
                        }, 2000)
                      }
                    />

                    <OutlinedInput
                      value="opt out?"
                      type="button"
                      onClick={() => setFieldValue('optedIn', false)}
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
                  <Typography sx={{ color: 'red' }}>{errors.phone}</Typography>
                </Box>
              )
            ) : null}

            {values.optedIn && !errors.phone ? (
              <OutlinedInput
                fullWidth
                type="submit"
                value="Request User ID"
                disabled={isSubmitting}
                inputProps={{ sx: { cursor: 'pointer' } }}
              />
            ) : null}
          </Form>
        </Box>
      )}
    </Formik>
  );
};

export default NewUserForm;
