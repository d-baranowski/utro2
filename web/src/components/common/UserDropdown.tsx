import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Skeleton } from '@mui/material';
import { useQuery } from '@connectrpc/connect-query';
import { getOrganisationUsers } from '../../../generated/organisation/v1/organisation-OrganisationService_connectquery';
import { create } from '@bufbuild/protobuf';
import {
  GetOrganisationUsersRequestSchema,
  User,
  GetOrganisationUsersResponse,
} from '../../../generated/organisation/v1/organisation_pb';
import { useTranslation } from 'next-i18next';

interface UserDropdownProps {
  organisationId: string;
  value?: string;
  onChange: (userId: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  'data-testid'?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  organisationId,
  value,
  onChange,
  label,
  error,
  helperText,
  fullWidth = true,
  required = false,
  'data-testid': testId,
}) => {
  const { t } = useTranslation('common');

  const {
    data,
    error: queryError,
    isLoading,
  } = useQuery(
    getOrganisationUsers,
    create(GetOrganisationUsersRequestSchema, {
      organisationId,
    })
  );

  if (isLoading) {
    return (
      <Skeleton variant="rectangular" width="100%" height={56} data-testid={`${testId}-loading`} />
    );
  }

  if (queryError) {
    return (
      <FormControl fullWidth={fullWidth} error>
        <InputLabel>{label || t('common.users')}</InputLabel>
        <Select value="" disabled>
          <MenuItem value="">
            <em>{t('common.errorLoadingData')}</em>
          </MenuItem>
        </Select>
        <FormHelperText>{t('common.errorLoadingUsers')}</FormHelperText>
      </FormControl>
    );
  }

  const response = data as GetOrganisationUsersResponse;
  const users = response?.users || [];

  return (
    <FormControl fullWidth={fullWidth} error={error} required={required}>
      <InputLabel>{label || t('common.selectUser')}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        label={label || t('common.selectUser')}
        data-testid={testId}
      >
        {users.length === 0 ? (
          <MenuItem value="" disabled>
            <em>{t('common.noUsersAvailable')}</em>
          </MenuItem>
        ) : (
          users.map((user: User) => (
            <MenuItem key={user.id} value={user.id}>
              {user.fullName || user.username} ({user.username})
            </MenuItem>
          ))
        )}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
