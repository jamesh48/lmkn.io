import { Close } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Dialog,
  OutlinedInput,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Form, Formik } from 'formik';

interface PinPopupProps {
  pinPopupOpen: boolean;
  handlePinPopupOpen: (flag: boolean) => void;
  handleSendMessage: () => Promise<void>;
}
const PinPopup = (props: PinPopupProps) => {
  const validatePin = async (pin: string) => {
    const { data } = await axios({
      url: '/api/validatePin',
      params: { userId: 'james', pin },
    });

    return data.result;
  };
  return (
    <Dialog open={props.pinPopupOpen}>
      <Box>
        <Box sx={{ borderBottom: '1px solid black' }}>
          <Close
            onClick={() => props.handlePinPopupOpen(false)}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
        <Formik
          initialValues={{ inputPin: '', successMessage: false }}
          onSubmit={async (values, formikHelpers) => {
            const result = await validatePin(values.inputPin);
            if (result === true) {
              await props.handleSendMessage();
              await formikHelpers.setFieldValue('successMessage', true);
              setTimeout(() => {
                props.handlePinPopupOpen(false);
              }, 2000);
            } else {
              formikHelpers.setErrors({ inputPin: 'Incorrect Pin Code!' });
            }
            return 'ok';
          }}
          validateOnChange={true}
          validate={(values) => {
            if (values.inputPin.length < 4) {
              return {
                inputPin: 'Pin Length must be at least four characters',
              };
            }
            return {};
          }}
        >
          {({ values, handleChange, errors, isSubmitting }) => {
            return (
              <Form>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: '1rem',
                    width: '25rem',
                  }}
                >
                  <Typography sx={{ padding: '1rem' }}>
                    This User Requires a Pin to be Messaged.
                  </Typography>
                  {values.successMessage ? (
                    <Typography sx={{ color: 'green' }}>
                      {values.successMessage && 'Message Sent Succesfully!'}
                    </Typography>
                  ) : isSubmitting ? (
                    <CircularProgress />
                  ) : (
                    <Box>
                      <OutlinedInput
                        inputProps={{
                          maxLength: 8,
                          sx: { textAlign: 'center' },
                        }}
                        value={values.inputPin}
                        name="inputPin"
                        onChange={handleChange}
                        sx={{ height: '3rem' }}
                      />
                      <OutlinedInput
                        type="submit"
                        value="Send!"
                        sx={{ height: '3rem' }}
                      />
                    </Box>
                  )}
                  <Typography sx={{ color: 'red' }}>
                    {errors.inputPin && errors.inputPin}
                  </Typography>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Dialog>
  );
};

export default PinPopup;
