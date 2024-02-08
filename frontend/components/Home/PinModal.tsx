import {
  Box,
  CircularProgress,
  Dialog,
  OutlinedInput,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Close } from '@mui/icons-material';
import { Form, Formik } from 'formik';

interface PinModalProps {
  pinModalOpen: boolean;
  handlePinModalOpen: (flag: boolean) => void;
  userId: string;
}
const PinModal = (props: PinModalProps) => {
  return (
    <Dialog open={props.pinModalOpen}>
      <Box sx={{ width: '25rem' }}>
        <Close
          onClick={() => props.handlePinModalOpen(false)}
          sx={{ cursor: 'pointer' }}
        />
        <Formik
          initialValues={{ inputPin: '' }}
          onSubmit={async (values, helpers) => {
            await axios({
              url: '/api/updateUser',
              method: 'PUT',
              data: {
                updateField: 'pin',
                updateValue: values.inputPin,
                userId: props.userId,
                encrypt: true,
              },
            });
            helpers.resetForm();
            helpers.setSubmitting(false);
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingY: '.5rem',
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <OutlinedInput
                        inputProps={{
                          maxLength: 8,
                          sx: { textAlign: 'center' },
                        }}
                        value={values.inputPin}
                        name="inputPin"
                        onChange={handleChange}
                      />
                      <Typography color="red">
                        {errors.inputPin && errors.inputPin}
                      </Typography>
                    </Box>
                  )}
                  <OutlinedInput
                    type="submit"
                    value="submit"
                    inputProps={{ sx: { cursor: 'pointer' } }}
                  />
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Dialog>
  );
};

export default PinModal;
