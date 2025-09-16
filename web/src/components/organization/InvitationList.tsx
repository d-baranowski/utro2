import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Invitation } from '../../../generated/organisation/v1/invitation_pb';
import { MemberType } from '../../../generated/organisation/v1/organisation_pb';
import { Timestamp } from '@bufbuild/protobuf';

interface InvitationListProps {
  invitations: Invitation[];
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  isLoading?: boolean;
}

// Helper function to convert Timestamp to Date
const toDate = (timestamp: Timestamp | undefined): Date => {
  if (!timestamp) return new Date(0);
  return new Date(
    timestamp.seconds.toNumber() * 1000 + 
    Math.floor(timestamp.nanos / 1000000)
  );
};

// Helper function to get status display name
const getStatusDisplayName = (status: Invitation['status']): string => {
  switch (status) {
    case 1: return 'PENDING';
    case 2: return 'ACCEPTED';
    case 3: return 'DECLINED';
    case 4: return 'EXPIRED';
    default: return 'UNKNOWN';
  }
};

// Helper function to get member type display name
const getMemberTypeDisplayName = (memberType: MemberType): string => {
  switch (memberType) {
    case MemberType.MEMBER_TYPE_ADMINISTRATOR: return 'ADMINISTRATOR';
    case MemberType.MEMBER_TYPE_MEMBER: return 'MEMBER';
    default: return 'UNKNOWN';
  }
};

export const InvitationList: React.FC<InvitationListProps> = ({
  invitations,
  onAccept,
  onDecline,
  isLoading = false,
}) => {
  if (isLoading) {
    return <Typography>Loading invitations...</Typography>;
  }

  if (invitations.length === 0) {
    return <Typography>No pending invitations</Typography>;
  }

  const getStatusColor = (status: Invitation['status']) => {
    switch (status) {
      case 1: // PENDING
        return 'default';
      case 2: // ACCEPTED
        return 'success';
      case 3: // DECLINED
        return 'error';
      case 4: // EXPIRED
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Organization</TableCell>
            <TableCell>Invited As</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Expires</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>{invitation.organisationId}</TableCell>
              <TableCell>
                <Chip
                  label={getMemberTypeDisplayName(invitation.memberType)}
                  size="small"
                  color={invitation.memberType === MemberType.MEMBER_TYPE_ADMINISTRATOR ? 'primary' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusDisplayName(invitation.status)}
                  color={getStatusColor(invitation.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {toDate(invitation.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {invitation.status === 1 && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => onAccept(invitation.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => onDecline(invitation.id)}
                    >
                      Decline
                    </Button>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InvitationList;
