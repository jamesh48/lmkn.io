import { Box, Dialog, OutlinedInput, Typography } from '@mui/material';
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
      <Box>
        <Close onClick={() => props.handlePinModalOpen(false)} />
        <Formik
          initialValues={{ inputPin: '' }}
          onSubmit={async (values) => {
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
          {({ values, handleChange, errors }) => {
            return (
              <Form>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <OutlinedInput
                    inputProps={{ maxLength: 8, sx: { textAlign: 'center' } }}
                    value={values.inputPin}
                    name="inputPin"
                    onChange={handleChange}
                  />
                  <Typography color="red">
                    {errors.inputPin && errors.inputPin}
                  </Typography>
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
