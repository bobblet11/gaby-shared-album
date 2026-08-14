import { useState, useMemo } from "react";
import { config } from "../configs/config.js";
import { uploadPhoto } from "../api/photos.js";
import DOMPurify from "dompurify";

export function usePhotoUpload() {
        const [title, setTitle] = useState("");
        const [caption, setCaption] = useState("");
        const [file, setFile] = useState([]);

        const [dragOver, setDragOver] = useState(false);
        const [isMultipleFilesSelected, setIsMultipleFilesSelected] = useState(false);

        const [isUploading, setIsUploading] = useState(false);

        const sanitizeInput = (input) => {
                return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        };

        const validateInputs = (title, caption) => {
                if (!title.trim()) {
                        alert("Title is required.");
                        return false;
                }
                if (title.length > 100) {
                        alert("Title must be less than 100 characters.");
                        return false;
                }
                if (caption.length > 500) {
                        alert("Caption must be less than 500 characters.");
                        return false;
                }
                return true;
        };

        const previewUrls = useMemo(() => {
                if (!file || file.length === 0) return [];
                return file.map((f) => URL.createObjectURL(f));
        }, [file]);

        const handleSubmit = async (e) => {
                try {
                        e.preventDefault();
                        setIsUploading(true);

                        if (!file || file.length === 0) {
                                alert("Please select at least one image before uploading.");
                                return;
                        }

                        if (file.length > config.api.max_files_per_upload) {
                                alert(`Please select fewer than ${config.api.max_files_per_upload} images.`);
                                return;
                        }

                        if (!config.api.use_api || !config.api.domain) {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                        } else {
                                const formData = new FormData();

                                if (file.length === 1) {
                                        if (!validateInputs(title, caption)) return;

                                        formData.append("title", sanitizeInput(title));
                                        formData.append("caption", sanitizeInput(caption));
                                        formData.append("image", file[0]);
                                } else {
                                        file.forEach((f) => formData.append("image", f));
                                }

                                await uploadPhoto(formData);
                        }
                        alert("Successfully uploaded photo");
                } finally {
                        setTitle("");
                        setCaption("");
                        setFile([]);
                        setIsUploading(false);
                }
        };

        const onFileDrop = (e) => {
                e.preventDefault();
                setDragOver(false);
                const droppedFiles = Array.from(e.dataTransfer.files || []);
                if (droppedFiles.length > 0) {
                        setFile(droppedFiles);
                        setIsMultipleFilesSelected(droppedFiles.length > 1);
                }
        };

        const onFileDragOver = (e) => {
                e.preventDefault();
                setDragOver(true);
        };

        const onFileDragLeave = (e) => {
                e.preventDefault();
                setDragOver(false);
        };

        const onSelectedFilesChange = (e) => {
                const files = Array.from(e.target.files || []);

                if (files.length > config.api.max_files_per_upload) {
                        alert(`Please select fewer than ${config.api.max_files_per_upload} images.`);
                        return;
                }

                setFile(files);
                setIsMultipleFilesSelected(files.length > 1);
        };

        const updateTitle = (newTitle) => {
                setTitle(newTitle);
        };

        const updateCaption = (newCaption) => {
                setCaption(newCaption);
        };

        return { title, caption, dragOver, isMultipleFilesSelected, previewUrls, handleSubmit, isUploading, onFileDrop, onFileDragOver, onFileDragLeave, onSelectedFilesChange, updateTitle, updateCaption };
}
