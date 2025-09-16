import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import { Add as AddIcon, Send as SendIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useConnect } from 'connect-react-query';
import { InvitationList } from './InvitationList';
import {
  Invitation as InvitationType,
  MemberType,
  createInvitation,
  getInvitations,
  respondToInvitation,
} from '../../../generated/organisation/v1/invitation_pb';
import { useAuth } from '../../contexts/AuthContext';

interface MembersPageProps {
  organizationId: string;
  isAdmin: boolean;
}

const MembersPage: React.FC<MembersPageProps> = ({ organizationId, isAdmin }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [memberType, setMemberType] = useState<MemberType>(MemberType.MEMBER_TYPE_MEMBER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitations
  const { data: invitationsData, refetch: refetchInvitations } = useConnect(getInvitations, {
    organizationId,
  });

  const invitations = invitationsData?.invitations || [];
  const pendingInvitations = invitations.filter((inv) => inv.status === 1); // PENDING
  const pastInvitations = invitations.filter((inv) => inv.status !== 1);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      await createInvitation({
        organisationId: organizationId,
        email,
        memberType,
      });

      enqueueSnackbar('Invitation sent successfully', { variant: 'success' });
      setIsInviteDialogOpen(false);
      setEmail('');
      refetchInvitations();
    } catch (err) {
      console.error('Failed to send invitation:', err);
      setError('Failed to send invitation. Please try again.');
      enqueueSnackbar('Failed to send invitation', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespondToInvitation = async (invitationId: string, accept: boolean) => {
    try {
      await respondToInvitation({
        invitationId,
        accept,
      });

      enqueueSnackbar(accept ? 'Invitation accepted' : 'Invitation declined', {
        variant: 'success',
      });

      refetchInvitations();
    } catch (err) {
      console.error('Failed to respond to invitation:', err);
      enqueueSnackbar('Failed to process your response', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Team Members</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsInviteDialogOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="organization tabs"
          >
            <Tab label="Members" value="members" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>Invitations</span>
                  {pendingInvitations.length > 0 && (
                    <Box
                      sx={{
                        ml: 1,
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      {pendingInvitations.length}
                    </Box>
                  )}
                </Box>
              }
              value="invitations"
            />
          </Tabs>
        </Box>

        <TabPanel value="members" sx={{ p: 0, mt: 2 }}>
          {/* Members list will go here */}
          <Typography>Members list will be displayed here</Typography>
        </TabPanel>

        <TabPanel value="invitations" sx={{ p: 0, mt: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Pending Invitations
            </Typography>
            <InvitationList
              invitations={pendingInvitations}
              onAccept={(id) => handleRespondToInvitation(id, true)}
              onDecline={(id) => handleRespondToInvitation(id, false)}
              isLoading={isLoading}
            />
          </Box>

          {pastInvitations.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Past Invitations
              </Typography>
              <InvitationList
                invitations={pastInvitations}
                onAccept={() => {}}
                onDecline={() => {}}
              />
            </Box>
          )}
        </TabPanel>
      </TabContext>

      {/* Invite Member Dialog */}
      <Dialog
        open={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleInviteSubmit}>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Role</InputLabel>
                <Select
                  value={memberType}
                  onChange={(e: SelectChangeEvent<MemberType>) =>
                    setMemberType(e.target.value as MemberType)
                  }
                  label="Role"
                >
                  <MenuItem value={MemberType.MEMBER_TYPE_MEMBER}>Member</MenuItem>
                  <MenuItem value={MemberType.MEMBER_TYPE_ADMINISTRATOR}>Administrator</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setIsInviteDialogOpen(false)}
              startIcon={<CancelIcon />}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
              disabled={isLoading || !email}
            >
              Send Invitation
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MembersPage;
