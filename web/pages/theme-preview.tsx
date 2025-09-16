import React from 'react';
import {
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Box,
  Stack,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
} from '@mui/material';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface Props {}

export default function ThemePreview({}: Props) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Simple Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UTRO - Foundation Theme
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Typography variant="h2" gutterBottom color="primary">
              Foundation Theme Preview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              New color scheme inspired by Fundacja Bez Klamek
            </Typography>
          </Box>

          {/* Color Palette Showcase */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Color Palette
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">Primary Main</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.light',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">Primary Light</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.dark',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">Primary Dark</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'secondary.main',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">Secondary Main</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'secondary.light',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">Secondary Light</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'secondary.dark',
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Typography variant="caption">Secondary Dark</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Buttons */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Buttons
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              <Button variant="contained" color="primary">
                Primary Button
              </Button>
              <Button variant="contained" color="secondary">
                Secondary Button
              </Button>
              <Button variant="outlined" color="primary">
                Outlined Primary
              </Button>
              <Button variant="outlined" color="secondary">
                Outlined Secondary
              </Button>
              <Button variant="text" color="primary">
                Text Primary
              </Button>
              <Button variant="text" color="secondary">
                Text Secondary
              </Button>
            </Stack>
          </Paper>

          {/* Form Elements */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Form Elements
            </Typography>
            <Stack spacing={2} sx={{ maxWidth: 400 }}>
              <TextField label="Text Field" placeholder="Enter text here" />
              <TextField label="Text Field with Helper" helperText="This is helper text" />
              <TextField label="Focused Field" focused />
            </Stack>
          </Paper>

          {/* Typography */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Typography
            </Typography>
            <Stack spacing={2}>
              <Typography variant="h1">Heading 1</Typography>
              <Typography variant="h2">Heading 2</Typography>
              <Typography variant="h3">Heading 3</Typography>
              <Typography variant="h4">Heading 4</Typography>
              <Typography variant="h5">Heading 5</Typography>
              <Typography variant="h6">Heading 6</Typography>
              <Typography variant="body1">
                Body 1: This is the primary body text that would be used for main content throughout
                the application.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Body 2: This is secondary body text with different styling that would be used for
                supporting content.
              </Typography>
            </Stack>
          </Paper>

          {/* Alerts and Chips */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Alerts & Chips
            </Typography>
            <Stack spacing={2}>
              <Alert severity="success">Success alert with foundation green theme</Alert>
              <Alert severity="warning">Warning alert with orange accents</Alert>
              <Alert severity="info">Information alert</Alert>
              <Alert severity="error">Error alert</Alert>
              <Box>
                <Chip label="Primary Chip" color="primary" sx={{ mr: 1 }} />
                <Chip label="Secondary Chip" color="secondary" sx={{ mr: 1 }} />
                <Chip label="Default Chip" sx={{ mr: 1 }} />
              </Box>
            </Stack>
          </Paper>

          {/* Cards */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Cards
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              <Card sx={{ maxWidth: 300 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Foundation Card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This card demonstrates the new theme applied to Material UI card components.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Learn More
                  </Button>
                  <Button size="small" color="secondary">
                    Support
                  </Button>
                </CardActions>
              </Card>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
