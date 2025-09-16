import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Typography,
  Alert,
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation } from '@/contexts/OrganisationContext';
import { organisationApi } from '@/lib/api/organisation';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  memberType: number;
  joinedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

interface Invitation {
  id: string;
  email: string;
  organisationId: string;
  invitedBy?: User;
  memberType: number;
  status: number;
  createdAt?: any;
  expiresAt?: any;
}

const OrganizationMembersPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { currentOrganisation } = useOrganisation();

  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMemberType, setInviteMemberType] = useState(1); // MEMBER_TYPE_MEMBER
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove member confirmation dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const isAdmin = currentOrganisation?.memberType === 2; // MEMBER_TYPE_ADMINISTRATOR

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    if (!currentOrganisation) {
      console.warn('Please select an organization first');
      router.push('/');
      return;
    }

    if (!isAdmin) {
      console.error('You need administrator privileges to access this page');
      router.push('/');
      return;
    }

    loadData();
  }, [isAuthenticated, currentOrganisation, isAdmin, router]);

  const loadData = async () => {
    if (!currentOrganisation) return;

    setLoading(true);
    setError(null);
    try {
      const [usersData, invitationsData] = await Promise.all([
        organisationApi.getOrganisationUsers(currentOrganisation.id),
        organisationApi.getInvitations(currentOrganisation.id),
      ]);

      setMembers(usersData || []);
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load organization data. Please try again.');
      setMembers([]);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (!currentOrganisation || !inviteEmail) return;

    setInviteLoading(true);
    try {
      await organisationApi.createInvitation(currentOrganisation.id, inviteEmail, inviteMemberType);

      console.log('Invitation sent successfully');
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteMemberType(1);
      await loadData(); // Reload invitations
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      setError(error?.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await organisationApi.cancelInvitation(invitationId);
      console.log('Invitation cancelled');
      await loadData();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    }
  };

  const handleRemoveMemberClick = (member: User) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveMemberConfirm = async () => {
    if (!currentOrganisation || !memberToRemove) return;

    setRemoveLoading(true);
    try {
      await organisationApi.removeOrganisationMember(currentOrganisation.id, memberToRemove.id);
      console.log('Member removed successfully');
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
      await loadData(); // Reload members
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      setError(error?.message || 'Failed to remove member');
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleRemoveMemberCancel = () => {
    setIsRemoveDialogOpen(false);
    setMemberToRemove(null);
  };

  const getMemberTypeLabel = (memberType: number): string => {
    switch (memberType) {
      case 2:
        return 'Administrator';
      case 1:
        return 'Member';
      default:
        return 'Unknown';
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 1:
        return 'Pending';
      case 2:
        return 'Accepted';
      case 3:
        return 'Declined';
      case 4:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number): 'default' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 1:
        return 'default'; // Pending
      case 2:
        return 'success'; // Accepted
      case 3:
        return 'error'; // Declined
      case 4:
        return 'warning'; // Expired
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Container>
          <Alert severity="error">{t('organisation.adminPrivilegesRequired')}</Alert>
        </Container>
      </Layout>
    );
  }

  const pendingInvitations = invitations.filter((inv) => inv.status === 1);
  const pastInvitations = invitations.filter((inv) => inv.status !== 1);

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {t('organisation.members')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setIsInviteDialogOpen(true)}
          >
            {t('organisation.inviteMember')}
          </Button>
        </Box>

        {currentOrganisation && (
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            {t('organisation.managingMembersFor')}: <strong>{currentOrganisation.name}</strong>
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label={t('organisation.membersTab', { count: members.length })} value="members" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{t('organisation.invitations')}</span>
                  {pendingInvitations.length > 0 && (
                    <Chip label={pendingInvitations.length} color="primary" size="small" />
                  )}
                </Box>
              }
              value="invitations"
            />
          </Tabs>
        </Box>

        {activeTab === 'members' ? (
          <Box sx={{ mt: 3 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('common.username')}</TableCell>
                    <TableCell>{t('common.email')}</TableCell>
                    <TableCell>{t('common.role')}</TableCell>
                    <TableCell>{t('organisation.joined')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.fullName || '-'}</TableCell>
                      <TableCell>{member.username}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getMemberTypeLabel(member.memberType)}
                          color={member.memberType === 2 ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {member.joinedAt && member.joinedAt.seconds
                          ? new Date(Number(member.joinedAt.seconds) * 1000).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveMemberClick(member)}
                          size="small"
                          title={t('organisation.removeMember')}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {t('organisation.noMembersFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            {pendingInvitations.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('organisation.pendingInvitations')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('common.email')}</TableCell>
                        <TableCell>{t('common.role')}</TableCell>
                        <TableCell>{t('organisation.invitedBy')}</TableCell>
                        <TableCell>{t('organisation.expires')}</TableCell>
                        <TableCell>{t('common.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingInvitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={getMemberTypeLabel(invitation.memberType)}
                              color={invitation.memberType === 2 ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{invitation.invitedBy?.username || '-'}</TableCell>
                          <TableCell>
                            {invitation.expiresAt && invitation.expiresAt.seconds
                              ? new Date(
                                  Number(invitation.expiresAt.seconds) * 1000
                                ).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => handleCancelInvitation(invitation.id)}
                              size="small"
                              title={t('organisation.cancelInvitation')}
                            >
                              <CancelIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {pastInvitations.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('organisation.pastInvitations')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('common.email')}</TableCell>
                        <TableCell>{t('common.role')}</TableCell>
                        <TableCell>{t('common.status')}</TableCell>
                        <TableCell>{t('common.created')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pastInvitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={getMemberTypeLabel(invitation.memberType)}
                              color={invitation.memberType === 2 ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(invitation.status)}
                              color={getStatusColor(invitation.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {invitation.createdAt && invitation.createdAt.seconds
                              ? new Date(
                                  Number(invitation.createdAt.seconds) * 1000
                                ).toLocaleDateString()
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {invitations.length === 0 && (
              <Alert severity="info">{t('organisation.noInvitationsYet')}</Alert>
            )}
          </Box>
        )}

        {/* Invite Member Dialog */}
        <Dialog
          open={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('organisation.inviteNewMember')}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label={t('common.emailAddress')}
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                autoFocus
              />
              <FormControl fullWidth>
                <InputLabel>{t('common.role')}</InputLabel>
                <Select
                  value={inviteMemberType}
                  onChange={(e: SelectChangeEvent<number>) =>
                    setInviteMemberType(e.target.value as number)
                  }
                  label={t('common.role')}
                >
                  <MenuItem value={1}>{t('organisation.memberRole')}</MenuItem>
                  <MenuItem value={2}>{t('organisation.administratorRole')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsInviteDialogOpen(false)} disabled={inviteLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleInviteSubmit}
              disabled={!inviteEmail || inviteLoading}
              startIcon={inviteLoading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {t('organisation.sendInvitation')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Remove Member Confirmation Dialog */}
        <Dialog
          open={isRemoveDialogOpen}
          onClose={handleRemoveMemberCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('organisation.removeMemberTitle')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('organisation.removeMemberConfirm', {
                name: memberToRemove?.fullName || memberToRemove?.username,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('organisation.removeMemberWarning')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRemoveMemberCancel} disabled={removeLoading}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemoveMemberConfirm}
              disabled={removeLoading}
              startIcon={removeLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {t('organisation.removeMemberAction')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default OrganizationMembersPage;
