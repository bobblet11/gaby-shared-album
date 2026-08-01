import React, { useEffect, useMemo, useRef, useState } from "react";
import Photo from "./Photo";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import DOMPurify from "dompurify";

function rand(min, max) {
        return Math.random() * (max - min) + min;
}

function samePhoto(a, b) {
        if (!a || !b) return false;
        return a.title === b.title && a.caption === b.caption && a.image_endpoint === b.image_endpoint;
}
export default function PhotoBoard({ photos = [] }) {
        const boardRef = useRef(null);
        const [openPhoto, setOpenPhoto] = useState(null);
        const [editDraft, setEditDraft] = useState(null);

        const [isEditingPhoto, setIsEditingPhoto] = useState(false);
        const [isUploading, setIsUploading] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);
        const [isDownloading, setIsDownloading] = useState(false);

        useEffect(() => {
                if (openPhoto) {
                        setEditDraft({
                                title: openPhoto.title ?? "",
                                caption: openPhoto.caption ?? "",
                                image_endpoint: openPhoto.image_endpoint ?? "",
                        });
                } else {
                        setEditDraft(null);
                }

                setIsEditingPhoto(false);
                setIsUploading(false);
                setIsDeleting(false);
                setIsDownloading(false);
        }, [openPhoto]);

        const isDirty = useMemo(() => {
                if (!openPhoto || !editDraft) return false;

                return !samePhoto(
                        {
                                title: openPhoto.title ?? "",
                                caption: openPhoto.caption ?? "",
                                image_endpoint: openPhoto.image_endpoint ?? "",
                        },
                        editDraft,
                );
        }, [openPhoto, editDraft]);

        const API_URL = process.env.REACT_APP_API_URL;
        const USE_API_URL = process.env.REACT_APP_FEATURE_FLAG === "true";
        const items = useMemo(() => {
                const count = photos.length;

                if (count === 0) return [];

                return photos.map((p, i) => {
                        // Very minor random deviations for subtle scattered look
                        const offsetX = rand(-3, 3); // ±3px offset
                        const offsetY = rand(-3, 3); // ±3px offset
                        const rotation = rand(-2, 2); // ±2 degrees rotation
                        const size = rand(0.98, 1.02); // ±2% size variation

                        const zIndex = Math.floor(rand(1, 4));

                        return {
                                ...p,
                                rotation,
                                size,
                                zIndex,
                                offsetX,
                                offsetY,
                        };
                });
        }, [photos]);

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

        const sanitizeInput = (input) => {
                return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        };

        const handleDelete = async (photo) => {
                try {
                        const confirmed = window.confirm("Are you sure you want to delete this photo?");
                        if (!confirmed) return; // stop if user cancels
                        setIsDeleting(true);

                        if (!USE_API_URL || !API_URL) {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                                alert("Delete successful");
                        } else {
                                const body = {
                                        imageEndpoint: sanitizeInput(photo.image_endpoint),
                                        placeholderEndpoint: sanitizeInput(photo.placeholder_endpoint),
                                };

                                const response = await fetch(`${API_URL}/api/photo/delete`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(body),
                                });

                                if (!response.ok) {
                                        throw new Error(`Delete failed: ${response.statusText}`);
                                }

                                const result = await response.json();
                                alert("Delete successful:", result);
                        }
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
                        if (!openPhoto || !editDraft) return;
                        if (!validateInputs(editDraft.title, editDraft.caption)) return;
                        setIsUploading(true);

                        if (USE_API_URL && API_URL) {
                                const body = {
                                        title: sanitizeInput(editDraft.title),
                                        caption: sanitizeInput(editDraft.caption),
                                        imageEndpoint: sanitizeInput(editDraft.image_endpoint),
                                };

                                const response = await fetch(`${API_URL}/api/photo/edit`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(body),
                                });

                                if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
                        } else {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                        }

                        alert("Edit successful");
                } catch (error) {
                        console.error("Error editing file:", error);
                        alert("Failed to edit");
                } finally {
                        window.location.reload(false);
                        setIsUploading(false);
                        setIsEditingPhoto(false);
                }
        };

        const handleDownload = async () => {
                try {
                        setIsDownloading(true);
                        const response = await fetch(openPhoto.checkedImageUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = openPhoto.title || "photo.jpg";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                } catch (error) {
                        console.error("Error downloading file:", error);
                        alert("Failed to download");
                } finally {
                        setIsDownloading(false);
                }
        };

        const onOpenPhoto = (photo) => {
                if (openPhoto && photo.imageUrl === openPhoto.imageUrl) {
                        return;
                }
                setOpenPhoto(photo);
        };

        const onClosePhoto = () => {
                setOpenPhoto(null);
        };

        const onExitEdit = () => {
                setEditDraft({
                        title: openPhoto.title ?? "",
                        caption: openPhoto.caption ?? "",
                        image_endpoint: openPhoto.image_endpoint ?? "",
                });
                setIsEditingPhoto(false);
        };

        return (
                <>
                        {openPhoto && (
                                <div
                                        className="photo-modal-backdrop"
                                        onClick={() => {
                                                if (!(isEditingPhoto || isUploading || isDeleting || isDownloading)) onClosePhoto();
                                        }}
                                >
                                        {( isDeleting || isDownloading) && (
                                                <div className="spinner-overlay">
                                                        <div
                                                                className="spinner"
                                                                style={{
                                                                        width: "10vw",
                                                                        height: "10vw",
                                                                }}
                                                        ></div>
                                                </div>
                                        )}

                                        {isEditingPhoto && editDraft && (
                                                <div className="photo-modal-backdrop" onClick={() => isEditingPhoto && !isUploading && onExitEdit()}>
                                                        <div className="upload-card" onClick={(e) => e.stopPropagation()}>
                                                                <div className="upload-header">
                                                                        <h1>{`Edit image ${openPhoto.title}`}</h1>
                                                                        <button type="button" className="close-btn" onClick={onExitEdit} disabled={isUploading} aria-label="Close edit panel">
                                                                                ×
                                                                        </button>
                                                                </div>
                                                                {isUploading && <div className="spinner" style={{ margin: "4rem auto" }}></div>}
                                                                {!isUploading && (
                                                                        <form className="upload-form" onSubmit={handleEditSubmit}>
                                                                                <input type="text" placeholder="Title" value={editDraft.title} onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))} disabled={isUploading} />

                                                                                <textarea placeholder="Caption" value={editDraft.caption} onChange={(e) => setEditDraft((prev) => ({ ...prev, caption: e.target.value }))} disabled={isUploading} />

                                                                                <button type="submit" disabled={isUploading || !isDirty}>
                                                                                        Submit edit
                                                                                </button>
                                                                        </form>
                                                                )}
                                                        </div>
                                                </div>
                                        )}

                                        <div className="photo-modal-image-container" onClick={(e) => e.stopPropagation()}>
                                                <TransformWrapper disabled={isUploading || isDeleting || isDownloading || isEditingPhoto} initialScale={1} minScale={1} maxScale={5} centerOnInit wheel={{ step: 0.001 }} pinch={{ step: 1 }}>
                                                        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
                                                                <img className="photo-modal-image" src={openPhoto.checkedImageUrl} alt={openPhoto.title} />
                                                        </TransformComponent>
                                                </TransformWrapper>

                                                <div className="photo-modal-buttons">
                                                        <button
                                                                type="button"
                                                                className="photo-modal-download"
                                                                onClick={() => {
                                                                        handleDownload();
                                                                }}
                                                                disabled={isUploading || isDeleting || isDownloading}
                                                        >
                                                                <i className="fas fa-download" aria-hidden="true"></i>
                                                        </button>
                                                        <button
                                                                className="photo-modal-delete"
                                                                onClick={() => {
                                                                        handleDelete(openPhoto);
                                                                }}
                                                                disabled={isUploading || isDeleting || isDownloading}
                                                        >
                                                                <i className="fa fa-trash" aria-hidden="true"></i>
                                                        </button>
                                                        <button className="photo-modal-edit" onClick={() => setIsEditingPhoto(true)} disabled={isUploading || isDeleting || isDownloading}>
                                                                <i className="fas fa-edit" aria-hidden="true"></i>
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        )}

                        <div ref={boardRef} className="photo-board">
                                {items.map((photo) => (
                                        <Photo key={photo.id} {...photo} onOpenPhoto={setOpenPhoto} />
                                ))}
                        </div>
                </>
        );
}
