"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";

const DropZone = styled(Box)(({ theme }) => ({
  border: "2px dashed #03dac6",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(5),
  textAlign: "center",
  backgroundColor: "#f4f4f4",
  cursor: "pointer",
  width: "100%",
  height: "150px",
  "&:hover": {
    backgroundColor: "#e0f7fa",
  },
}));
const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [snackbarData, setSnackbarData] = useState({
    message: "",
    severity: "",
  });

  useEffect(() => {
    const storedFiles =
      JSON.parse(localStorage.getItem("uploadedImages")) || [];
    setFiles(storedFiles);
  }, []);

  useEffect(() => {
    localStorage.setItem("uploadedImages", JSON.stringify(files));
  }, [files]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const validateAndAddFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter(
      (file) =>
        (file.type === "image/png" || file.type === "image/jpeg") &&
        file.size <= 500 * 1024
    );

    if (files.length + validFiles.length <= 5) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setSnackbarData({
        message: `${validFiles.length} images uploaded successfully.`,
        severity: "success",
      });
      setError("");
    } else {
      setError("You can only upload up to 5 images.");
    }

    if (validFiles.length !== selectedFiles.length) {
      setError("Only JPG and PNG files under 500KB are allowed.");
    }
  };

  const handleDelete = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setSnackbarData({
      message: "Image deleted successfully.",
      severity: "error",
    });
  };

  const handlePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRotate = (file, direction, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        canvas.width = img.height;
        canvas.height = img.width;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(direction === "left" ? -Math.PI / 2 : Math.PI / 2);
        context.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
          const updatedFile = new File([blob], file.name, { type: file.type });
          const updatedFiles = [...files];
          updatedFiles[index] = updatedFile; // به‌روزرسانی فایل در لیست
          setFiles(updatedFiles);
          setSnackbarData({
            message: `Image rotated ${direction}.`,
            severity: "success",
          });
        }, file.type);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 3,
        maxWidth: "60%",
        margin: "50px auto",
        textAlign: "center",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
      <Typography variant="h5" color="primary" mb={2}>
        Image Uploader
      </Typography>
      <DropZone onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        <Typography variant="body2" color="textSecondary">
          Drag and drop your files here
        </Typography>
      </DropZone>
      <Typography variant="body2" color="textSecondary" mt={1}>
        or select files below
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{
          backgroundColor: "#6200ea",
          color: "white",
          "&:hover": { backgroundColor: "#3700b3" },
        }}>
        Select Files
        <input
          type="file"
          hidden
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          multiple
        />
      </Button>
      {error && (
        <Typography variant="body2" color="error" mt={1}>
          {error}
        </Typography>
      )}
      <Grid container spacing={2} mt={2}>
        {files.map((file, index) => (
          <Grid item xs={4} key={index}>
            <Paper
              elevation={2}
              sx={{
                padding: 1,
                textAlign: "center",
                position: "relative",
              }}>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                onClick={() => handlePreview(file)}
              />
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                }}>
                <IconButton
                  onClick={() => handleRotate(file, "left", index)}
                  color="primary"
                  size="small">
                  <RotateLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleRotate(file, "right", index)}
                  color="primary"
                  size="small">
                  <RotateRightIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent preview on delete
                    handleDelete(index);
                  }}
                  color="error"
                  size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for image preview */}
      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)}>
        <img
          src={previewImage}
          alt="Preview"
          style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px" }}
        />
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={!!snackbarData.message}
        autoHideDuration={3000}
        onClose={() => setSnackbarData({ message: "", severity: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert
          onClose={() => setSnackbarData({ message: "", severity: "" })}
          severity={snackbarData.severity}
          sx={{ width: "100%" }}>
          {snackbarData.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default FileUploader;
