import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { Box, OutlinedInput, Typography } from '@mui/material';
import { Formik, Form } from 'formik';
import debounce from 'lodash/debounce';
import UserIdInput from './UserIdInput';
import PasswordInput from './PasswordInput';
import PhoneNumberInput from './PhoneNumberInput';
import OptInInput from './OptInInput';

const NewUserForm = () => {
  const [submissionError, setSubmissionError] = useState('');
  const [userIdMessage, setUserIdMessage] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');
  const createUser = async (values: {
    phone: string;
    userId: string;
    passwordOne: string;
  }) => {
    try {
      await axios({
        method: 'POST',
        url: '/api/createUser',
        params: {
          userId: values.userId,
          userPhone: values.phone,
          userPassword: values.passwordOne,
        },
      });
    } catch (err) {
      const typedErr = err as {
        response: { data: { error: string; success: boolean } };
      };
      setSubmissionError(typedErr.response.data.error);
    }
  };

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

  const validatePhone = async (phone: string) => {
    try {
      const { data } = await axios({
        method: 'GET',
        url: '/api/checkPhoneNumber',
        params: { userPhone: phone },
      });
      return data.success === true
        ? 'Phone Number already exists!'
        : 'Phone Number is Available!';
    } catch (error) {
      console.error('Error checking phone:', error);
      return '';
    }
  };

  const userIdRef = useRef(null);
  const phoneRef = useRef(null);

  const debouncedValidateUser = useCallback(
    debounce(async (userId: string) => {
      setUserIdMessage('Validating...'); // Show loading indicator
      const message = await validateUser(userId);
      setUserIdMessage(message); // Update error message
    }, 500),
    []
  );

  const debouncedValidatePhoneNumber = useCallback(
    debounce(async (phone: string) => {
      setPhoneMessage('Validating...');
      const message = await validatePhone(phone);
      setPhoneMessage(message);
    }, 500),
    []
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Formik
        initialValues={{
          phone: '',
          userId: '',
          optedIn: false,
          passwordOne: '',
          passwordTwo: '',
        }}
        validate={async (values) => {
          const errors = {} as {
            phone: string;
            userId: string;
            passwordOne: string;
            passwordTwo: string;
          };
          if (!values.userId.length) {
            setUserIdMessage('Required');
          } else if (values.userId.length > 0) {
            // Don't validate when the username is not being typed on
            if (userIdRef.current === document.activeElement) {
              debouncedValidateUser(values.userId);
            }
          }

          if (!values.phone.length) {
            setPhoneMessage('Required');
          } else if (!values.phone.startsWith('+1')) {
            setPhoneMessage('phone number must start with +1');
          } else if (values.phone.length !== 12) {
            setPhoneMessage('phone number must be 10 digits long');
          } else if (values.phone.length === 12) {
            if (phoneRef.current === document.activeElement) {
              debouncedValidatePhoneNumber(values.phone);
            }
          }
          if (!values.passwordOne) {
            errors.passwordOne = 'Required';
          } else if (
            values.passwordOne &&
            values.passwordTwo &&
            values.passwordOne.length < 8
          ) {
            errors.passwordOne = 'password must be at least 8 characters';
          } else if (values.passwordOne !== values.passwordTwo) {
            errors.passwordOne = 'passwords do not match';
          }

          if (Object.keys(errors).length) {
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
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid black',
              padding: '1rem',
              width: '25rem',
            }}
          >
            <Typography>{submissionError}</Typography>
            <Form>
              <UserIdInput
                handleChange={handleChange}
                userId={values.userId}
                userIdMessage={userIdMessage}
                inputRef={userIdRef}
              />
              {values.userId.length &&
              userIdMessage === 'User Identifier is Available!' ? (
                !values.optedIn ? (
                  <OptInInput setFieldValue={setFieldValue} />
                ) : (
                  <PhoneNumberInput
                    isValidating={isValidating}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    phoneErrors={phoneMessage}
                    phone={values.phone}
                    inputRef={phoneRef}
                  />
                )
              ) : null}

              {values.optedIn &&
              phoneMessage === 'Phone Number is Available!' ? (
                <PasswordInput
                  handleChange={handleChange}
                  passwordOneErrors={errors.passwordOne || 'Passwords Match!'}
                  passwordOne={values.passwordOne}
                  passwordTwo={values.passwordTwo}
                />
              ) : null}
              {!errors.passwordOne ? (
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
    </Box>
  );
};

export default NewUserForm;
