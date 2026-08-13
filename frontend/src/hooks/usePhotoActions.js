import { useState, useEffect } from "react";
import {config} from "../configs/config.js";
import DOMPurify from "dompurify";
import { deletePhoto, editPhoto, getImageBlob } from "../api/photos.js";

export function usePhotoActions(openPhoto, editDraft) {
        const [isUploading, setIsUploading] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);
        const [isDownloading, setIsDownloading] = useState(false);

        const sanitizeInput = (input) => {
                return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        };

        const validateInputs = (title, caption) => {
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

        const extractFilename = (url) => {
                const pathname = new URL(url).pathname;
                return pathname.substring(pathname.lastIndexOf("/") + 1);
        };

        const handleDelete = async (photo) => {
                try {
                        const confirmed = window.confirm("Are you sure you want to delete this photo?");
                        if (!confirmed) return; // stop if user cancels
                        setIsDeleting(true);

                        if (!config.api.use_api || !config.api.domain) {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                        } else {
                                const filename = extractFilename(photo.image_endpoint);
                                await deletePhoto(filename);
                        }
                        alert("Delete successful");
                } catch (error) {
                        console.error("Error deleting file:", error);
                        alert("Failed to delete");
                } finally {
                        setIsDeleting(false);
                        window.location.reload(false);
                }
        };

        const handleEditSubmit = async (e) => {
                e.preventDefault();
                try {
                        const isPhotoOpen = openPhoto || editDraft;
                        const isInvalidInputs = validateInputs(editDraft.title, editDraft.caption);
                        if (!isPhotoOpen || !isInvalidInputs) return;
                        setIsUploading(true);

                        if (!config.api.use_api || !config.api.domain) {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                        } else {
                                const filename = extractFilename(openPhoto.image_endpoint);
                                const data = {
                                        title: sanitizeInput(editDraft.title),
                                        caption: sanitizeInput(editDraft.caption),
                                };
                                await editPhoto(filename, data);
                                
                        }
                        alert("Edit successful");
                } catch (error) {
                        console.error("Error editing file:", error);
                        alert("Failed to edit");
                } finally {
                        window.location.reload(false);
                        setIsUploading(false);
                }
        };

        const handleDownload = async () => {
                try {
                        setIsDownloading(true);

                        if (!config.api.use_api || !config.api.domain) {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                        } else {
                                const imageUrl = openPhoto.checkedImageUrl;
                                const blob = await getImageBlob(imageUrl);

                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = openPhoto.title || "photo.jpg";
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                window.URL.revokeObjectURL(url);
                        }
                        alert("Download successful");
                } catch (error) {
                        console.error("Error downloading file:", error);
                        alert("Failed to download");
                } finally {
                        setIsDownloading(false);
                }
        };

        useEffect(() => {
                setIsUploading(false);
                setIsDeleting(false);
                setIsDownloading(false);
        }, [openPhoto]);

        return {
                isUploading,
                isDeleting,
                isDownloading,
                handleDelete,
                handleEditSubmit,
                handleDownload,
        };
}
