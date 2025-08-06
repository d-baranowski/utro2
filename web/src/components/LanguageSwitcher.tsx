import React from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  ListItemIcon,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'next-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

interface LanguageSwitcherProps {
  variant?: 'button' | 'icon';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'button' }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = languages.find((lang) => lang.code === router.locale) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: languageCode });
    handleClose();
  };

  const renderButton = () => {
    if (variant === 'icon' || isMobile) {
      return (
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          aria-label="change language"
        >
          <LanguageIcon />
        </IconButton>
      );
    }

    return (
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        endIcon={<span style={{ fontSize: '1.2em' }}>{currentLanguage.flag}</span>}
        variant="outlined"
        size="small"
        sx={{
          textTransform: 'none',
          minWidth: 'auto',
          color: 'text.primary',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        {currentLanguage.name}
      </Button>
    );
  };

  return (
    <>
      {renderButton()}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            selected={language.code === router.locale}
            sx={{ minWidth: 140 }}
          >
            <ListItemIcon sx={{ minWidth: '40px !important' }}>
              <Typography sx={{ fontSize: '1.2em' }}>{language.flag}</Typography>
            </ListItemIcon>
            <Box>
              <Typography variant="body2" fontWeight={language.code === router.locale ? 600 : 400}>
                {language.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
