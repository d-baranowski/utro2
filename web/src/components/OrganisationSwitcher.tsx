'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { useOrganisation } from '@/contexts/OrganisationContext';
import { MemberType } from '@/generated/organisation/v1/organisation_pb';

interface OrganisationSwitcherProps {
  onCreateOrganisation: () => void;
}

export default function OrganisationSwitcher({ onCreateOrganisation }: OrganisationSwitcherProps) {
  const { organisations, currentOrganisation, selectOrganisation } = useOrganisation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectOrganisation = (org: (typeof organisations)[0]) => {
    selectOrganisation(org);
    handleClose();
  };

  const getMemberTypeLabel = (memberType: MemberType) => {
    switch (memberType) {
      case MemberType.MEMBER_TYPE_ADMINISTRATOR:
      case MemberType.ADMINISTRATOR:
        return 'Admin';
      case MemberType.MEMBER_TYPE_MEMBER:
      case MemberType.MEMBER:
        return 'Member';
      default:
        return '';
    }
  };

  if (!currentOrganisation) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          textTransform: 'none',
          borderColor: 'divider',
          color: 'text.primary',
          minWidth: 200,
          justifyContent: 'space-between',
        }}
        data-testid="organisation-switcher-button"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon fontSize="small" />
          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
            {currentOrganisation.name}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 280, mt: 1 },
        }}
      >
        <Box sx={{ px: 2, py: 1, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Switch Organisation
          </Typography>
        </Box>
        {organisations.map((org) => (
          <MenuItem
            key={org.id}
            onClick={() => handleSelectOrganisation(org)}
            selected={org.id === currentOrganisation.id}
            data-testid={`organisation-option-${org.id}`}
          >
            <ListItemIcon>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={org.name}
              secondary={org.description ? org.description.substring(0, 50) + '...' : null}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {org.memberType && (
                <Chip
                  label={getMemberTypeLabel(org.memberType)}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
              {org.id === currentOrganisation.id && <CheckIcon fontSize="small" color="primary" />}
            </Box>
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => {
            handleClose();
            onCreateOrganisation();
          }}
          data-testid="create-organisation-menu-item"
        >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Create Organisation" />
        </MenuItem>
      </Menu>
    </>
  );
}
