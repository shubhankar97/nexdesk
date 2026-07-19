import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { DOCUMENT_STATUS } from '../../../constants/document.js';
import { PARSE_STATUS } from '../../../constants/invoice.js';

const DocumentHistoryFilters = ({
  filters,
  onChange,
  onClear,
  disabled = false,
}) => {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        useFlexGap
        sx={{ flexWrap: 'wrap' }}
      >
        <TextField
          size="small"
          label="Search"
          placeholder="File, invoice #, vendor, customer"
          value={filters.search}
          onChange={(event) => update({ search: event.target.value })}
          disabled={disabled}
          sx={{ minWidth: { md: 260 }, flex: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="history-ocr-status">OCR status</InputLabel>
          <Select
            labelId="history-ocr-status"
            label="OCR status"
            value={filters.status}
            onChange={(event) => update({ status: event.target.value })}
            disabled={disabled}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(DOCUMENT_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="history-parse-status">Parse status</InputLabel>
          <Select
            labelId="history-parse-status"
            label="Parse status"
            value={filters.parseStatus}
            onChange={(event) => update({ parseStatus: event.target.value })}
            disabled={disabled}
          >
            <MenuItem value="">All</MenuItem>
            {Object.values(PARSE_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="From"
          type="date"
          value={filters.dateFrom}
          onChange={(event) => update({ dateFrom: event.target.value })}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          size="small"
          label="To"
          type="date"
          value={filters.dateTo}
          onChange={(event) => update({ dateTo: event.target.value })}
          disabled={disabled}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <Button size="small" onClick={onClear} disabled={disabled}>
          Clear
        </Button>
      </Stack>
    </Box>
  );
};

export default DocumentHistoryFilters;
