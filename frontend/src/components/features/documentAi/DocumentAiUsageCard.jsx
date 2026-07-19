import {
  Alert,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

const DocumentAiUsageCard = ({ usage, loading = false, compact = false }) => {
  if (loading && !usage) {
    return (
      <Box sx={{ mb: compact ? 2 : 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!usage) {
    return null;
  }

  const { uploads, plan, access, periodKey } = usage;
  const percent =
    uploads.unlimited || !uploads.limit
      ? 0
      : Math.min(100, Math.round((uploads.used / uploads.limit) * 100));
  const exhausted = !uploads.unlimited && uploads.remaining === 0;

  return (
    <Box
      sx={{
        mb: compact ? 2 : 3,
        p: 2.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Document AI usage
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={access?.allowed ? 'Entitled' : 'Not entitled'}
            color={access?.allowed ? 'success' : 'default'}
            variant={access?.allowed ? 'filled' : 'outlined'}
          />
          {plan?.name && <Chip size="small" label={plan.name} variant="outlined" />}
          <Chip size="small" label={`Period ${periodKey}`} variant="outlined" />
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {uploads.unlimited
          ? `${uploads.used} uploads this month (unlimited)`
          : `${uploads.used} of ${uploads.limit} uploads this month`}
      </Typography>

      {!uploads.unlimited && (
        <LinearProgress
          variant="determinate"
          value={percent}
          color={exhausted ? 'error' : percent >= 80 ? 'warning' : 'primary'}
          sx={{ height: 8, borderRadius: 1, mb: 1.5 }}
        />
      )}

      {!access?.allowed && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Document AI requires the Master add-on plus a plan that includes the{' '}
          <strong>document-ai</strong> feature (or a Master plan override).
        </Alert>
      )}

      {access?.allowed && exhausted && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Monthly upload limit reached. Upgrade your plan or wait until next month.
        </Alert>
      )}

      {!compact && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Addon: {access?.addonEnabled ? 'on' : 'off'} · Plan feature:{' '}
          {access?.planFeatureEnabled ? 'yes' : 'no'}
          {access?.planOverride ? ' · Plan override: on' : ''}
        </Typography>
      )}
    </Box>
  );
};

export default DocumentAiUsageCard;
