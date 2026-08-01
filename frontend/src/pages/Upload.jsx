import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

export default function UploadPage() {
        const API_URL = process.env.REACT_APP_API_URL;
        const USE_API_URL = process.env.REACT_APP_FEATURE_FLAG === "true";
        const navigate = useNavigate();
        const [title, setTitle] = useState("");
        const [caption, setCaption] = useState("");
        const [file, setFile] = useState(null);
        const [dragOver, setDragOver] = useState(false);
        const [isUploading, setIsUploading] = useState(false);

        const [isMultipleFilesSelected, setIsMultipleFilesSelected] = useState(false);

        const goToHomePage = () => {
                try {
                        navigate("/");
                } catch (error) {
                        console.error("Navigation error:", error);
                }
        };

        const previewUrls = useMemo(() => {
                if (!file || file.length === 0) return [];
                return file.map((f) => URL.createObjectURL(f));
        }, [file]);

        const MAX_FILE_UPLOAD = 15;

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

        const sanitizeInput = (input) => {
                return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        };

        const handleSubmit = async (e) => {
                try {
                        e.preventDefault();
                        setIsUploading(true);

                        if (!file || file.length === 0) {
                                alert("Please select at least one image before uploading.");
                                return;
                        }

                        if (file.length > MAX_FILE_UPLOAD) {
                                alert(`Please select fewer than ${MAX_FILE_UPLOAD} images.`);
                                return;
                        }

                        if (USE_API_URL && API_URL) {
                                const formData = new FormData();
                                if (file.length === 1) {
                                        if (!validateInputs(title, caption)) return;
                                        formData.append("title", sanitizeInput(title));
                                        formData.append("caption", sanitizeInput(caption));
                                        formData.append("image", file[0]);
                                } else {
                                        file.forEach((f) => formData.append("image", f));
                                }

                                const response = await fetch(`${API_URL}/api/photo`, {
                                        method: "POST",
                                        body: formData,
                                });

                                if (!response.ok) {
                                        throw new Error(`Upload failed: ${response.statusText}`);
                                }

                                const result = await response.json();
                        } else {
                                await new Promise((resolve) => setTimeout(resolve, 5000));
                        }
                        alert("Successfully uploaded photo");
                } finally {
                        setTitle("");
                        setCaption("");
                        setFile(null);
                        setIsUploading(false);
                }
        };

        return (
                <div className="upload-page">
                        <header className="top-banner">
                                <div className="title-card">Gaby's Corkboard</div>
                                <button className="upload-button" onClick={goToHomePage} disabled={isUploading}>
                                        Home
                                </button>
                        </header>

                        <div className="upload-card">
                                <div className="upload-header">
                                        <h1>Upload a Polaroid</h1>
                                </div>

                                <form className="upload-form" onSubmit={handleSubmit}>
                                        {isUploading && <div className="spinner" style={{ margin: "4rem auto" }}></div>}
                                        {!isUploading && (
                                                <>
                                                        <div
                                                                className={`upload-dropzone ${dragOver ? "drag-over" : ""}`}
                                                                onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        setDragOver(false);
                                                                        const dropped = e.dataTransfer.files?.[0];
                                                                        if (dropped) setFile(dropped);
                                                                }}
                                                                onDragOver={(e) => {
                                                                        e.preventDefault();
                                                                        setDragOver(true);
                                                                }}
                                                                onDragLeave={() => setDragOver(false)}
                                                        >
                                                                {previewUrls.length > 0 ? (
                                                                        <div className="upload-preview-slider">
                                                                                {previewUrls.map((url, idx) => (
                                                                                        <div key={idx} className="upload-preview-item">
                                                                                                <img className="upload-preview" src={url} alt={`Preview ${idx}`} />
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                ) : (
                                                                        <p>{`Drag and drop images (at most ${MAX_FILE_UPLOAD}) here, or tap below to select`}</p>
                                                                )}

                                                                <label className="file-upload-button">
                                                                        Select Images
                                                                        <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                multiple
                                                                                onChange={(e) => {
                                                                                        const files = Array.from(e.target.files);

                                                                                        if (files.length > MAX_FILE_UPLOAD) {
                                                                                                alert(`Please select fewer than ${MAX_FILE_UPLOAD} images.`);
                                                                                                return;
                                                                                        }

                                                                                        if (files.length > 1) {
                                                                                                setIsMultipleFilesSelected(false);
                                                                                        } else {
                                                                                                setIsMultipleFilesSelected(true);
                                                                                        }

                                                                                        setFile(Array.from(e.target.files));
                                                                                }}
                                                                                style={{ display: "none" }}
                                                                                disabled={isUploading}
                                                                        />
                                                                </label>
                                                        </div>

                                                        {isMultipleFilesSelected ? <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} /> : <></>}
                                                        {isMultipleFilesSelected ? <textarea placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} disabled={isUploading} /> : <></>}

                                                        <button type="submit" disabled={isUploading}>
                                                                Upload
                                                        </button>
                                                </>
                                        )}
                                </form>
                        </div>
                </div>
        );
}
