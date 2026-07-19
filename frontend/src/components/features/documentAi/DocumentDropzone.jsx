import { useCallback, useRef, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, Typography } from '@mui/material';
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_FILE_SIZE,
  DOCUMENT_MAX_FILES,
  isAllowedDocumentFile,
} from '../../../constants/document.js';

const DocumentDropzone = ({ disabled, onFilesSelected }) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState('');

  const processFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);

      if (!files.length) {
        return;
      }

      if (files.length > DOCUMENT_MAX_FILES) {
        setLocalError(`You can select up to ${DOCUMENT_MAX_FILES} files at once.`);
        return;
      }

      const invalidType = files.find((file) => !isAllowedDocumentFile(file));
      if (invalidType) {
        setLocalError(`"${invalidType.name}" is not a supported PDF or image file.`);
        return;
      }

      const tooLarge = files.find((file) => file.size > DOCUMENT_MAX_FILE_SIZE);
      if (tooLarge) {
        setLocalError(`"${tooLarge.name}" exceeds the 10 MB limit.`);
        return;
      }

      setLocalError('');
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (disabled) {
      return;
    }

    processFiles(event.dataTransfer.files);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  return (
    <Box>
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          borderRadius: 2,
          px: 3,
          py: 5,
          textAlign: 'center',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
        }}
      >
        <CloudUploadIcon color={dragActive ? 'primary' : 'action'} sx={{ fontSize: 42, mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Drop PDF or image files here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          PDF, JPEG, PNG, WebP, or GIF — up to {DOCUMENT_MAX_FILES} files, 10 MB each
        </Typography>
        <Button
          variant="contained"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept={DOCUMENT_ACCEPT}
          disabled={disabled}
          onChange={(event) => {
            processFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </Box>
      {localError && (
        <Typography variant="body2" color="error" sx={{ mt: 1.5 }}>
          {localError}
        </Typography>
      )}
    </Box>
  );
};

export default DocumentDropzone;
