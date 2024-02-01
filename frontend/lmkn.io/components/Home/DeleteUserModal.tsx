import { Close } from '@mui/icons-material';
import { Box, Dialog, OutlinedInput, Typography } from '@mui/material';

interface DeleteUserModalProps {
  deleteUserModalOpen: boolean;
  handleDeleteUserModalOpen: (flag: boolean) => void;
}

const DeleteUserModal = (props: DeleteUserModalProps) => {
  return (
    <Dialog open={props.deleteUserModalOpen}>
      <Box sx={{ width: '25rem' }}>
        <Close
          onClick={() => props.handleDeleteUserModalOpen(false)}
          sx={{ cursor: 'pointer' }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            paddingY: '.5rem',
          }}
        >
          <Typography>Confirm Releasing your UserId?</Typography>
          <OutlinedInput
            value="confirm"
            type="button"
            inputProps={{ sx: { cursor: 'pointer' } }}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default DeleteUserModal;
