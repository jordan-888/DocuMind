import { useState, useRef } from 'react';
import {
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress,
  Alert,
  Fade,
} from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

interface DocumentUploadProps {
  onUpload: (file: File, onProgress?: (progress: number) => void) => Promise<any>;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.includes('pdf')) {
      setMessage('Please select a PDF file.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage('');

    try {
      // Use real upload progress from backend
      await onUpload(file, (progressPercent) => {
        setProgress(progressPercent);
      });

      setProgress(100);
      setMessage('File uploaded successfully!');

      // Reset after 3 seconds
      setTimeout(() => {
        setProgress(0);
        setMessage('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed';

      if (error.response?.data?.detail) {
        // Backend returned a detailed error message
        errorMessage = `Upload failed: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      setMessage(errorMessage);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <Stack spacing={3}>
      <Paper
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          px: { xs: 4, md: 6 },
          py: { xs: 6, md: 8 },
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: uploading ? 'primary.light' : 'rgba(76,96,255,0.25)',
          borderRadius: 5,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(76,96,255,0.08), rgba(6,182,212,0.08))',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 25px 70px -40px rgba(76,96,255,0.55)',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(76,96,255,0.2), rgba(6,182,212,0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 18px 45px -25px rgba(76,96,255,0.45)',
            }}
          >
            <CloudUploadRoundedIcon color="primary" fontSize="large" />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Drop your PDF here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload up to 25MB per document. We automatically extract, chunk, and embed.
            </Typography>
          </Stack>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="contained"
            startIcon={<FolderOpenRoundedIcon />}
            sx={{
              borderRadius: '999px',
              px: 4,
              py: 1.5,
              backgroundImage: 'linear-gradient(135deg, #4c60ff 0%, #06b6d4 100%)',
              boxShadow: '0 18px 45px -22px rgba(76,96,255,0.55)',
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #3d4be0 0%, #0593b3 100%)',
              },
            }}
          >
            {uploading ? 'Uploading…' : 'Browse device'}
          </Button>

          <Chip
            icon={<PictureAsPdfRoundedIcon />}
            label="Drag & drop supported · PDF only"
            variant="outlined"
            sx={{ borderRadius: '999px', color: 'text.secondary' }}
          />
        </Stack>
      </Paper>

      <Fade in={uploading} unmountOnExit>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Preparing upload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(76,96,255,0.12)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundImage: 'linear-gradient(135deg, #4c60ff, #06b6d4)',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              This stays under 90% until processing completes.
            </Typography>
          </Stack>
        </Paper>
      </Fade>

      <Fade in={Boolean(message)} unmountOnExit>
        <Alert
          icon={message.includes('successfully') ? <CheckCircleRoundedIcon fontSize="small" /> : <ErrorRoundedIcon fontSize="small" />}
          severity={message.includes('successfully') ? 'success' : 'error'}
          variant="outlined"
          sx={{ borderRadius: 3 }}
        >
          {message}
        </Alert>
      </Fade>
    </Stack>
  );
};

export default DocumentUpload;

