import React from "react";
import { useNavigate } from "react-router-dom";
import { usePhotoUpload } from "../hooks/usePhotosUpload";
import { config } from "../configs/config.js";
import PageBanner from "../components/PageBanner.jsx";
import Spinner from "../components/Spinner.jsx";
import PropTypes from "prop-types";

export default function UploadPage({ variant = "default" }) {
        const navigate = useNavigate();

        const { title, caption, dragOver, isMultipleFilesSelected, previewUrls, handleSubmit, isUploading, onFileDrop, onFileDragOver, onFileDragLeave, onSelectedFilesChange, updateTitle, updateCaption } = usePhotoUpload();

        const goToHomePage = () => {
                try {
                        navigate("/");
                } catch (error) {
                        console.error("Navigation error:", error);
                }
        };

        return (
                <div className="upload-page">
                        {/* <PageBanner title="Gaby&apos;s Corkboard" nextPageName="Home" goToNextPage={goToHomePage} variant="anniversary"/> */}
                        <PageBanner title="Happy Anniversary 💖" nextPageName="Home" goToNextPage={goToHomePage} variant="default" />

                        <div className="upload-card">
                                <div className="upload-header">
                                        <h1>Upload a Polaroid</h1>
                                </div>

                                <form className="upload-form" onSubmit={handleSubmit}>
                                        {isUploading && <Spinner variant={variant} style={{ margin: "4rem auto" }} />}
                                        {!isUploading && (
                                                <>
                                                        <div className={`upload-dropzone ${dragOver ? "drag-over" : ""}`} onDrop={(e) => onFileDrop(e)} onDragOver={(e) => onFileDragOver(e)} onDragLeave={(e) => onFileDragLeave(e)}>
                                                                {previewUrls.length > 0 ? (
                                                                        <div className="upload-preview-slider">
                                                                                {previewUrls.map((url, idx) => (
                                                                                        <div key={idx} className="upload-preview-item">
                                                                                                <img className="upload-preview" src={url} alt={`Preview ${idx}`} />
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                ) : (
                                                                        <p>{`Drag and drop images (at most ${config.api.max_files_per_upload}) here, or tap below to select`}</p>
                                                                )}

                                                                <label className="file-upload-button">
                                                                        Select Images
                                                                        <input type="file" accept="image/*" multiple onChange={(e) => onSelectedFilesChange(e)} style={{ display: "none" }} disabled={isUploading} />
                                                                </label>
                                                        </div>

                                                        {!isMultipleFilesSelected ? <input type="text" placeholder="Title" value={title} onChange={(e) => updateTitle(e.target.value)} disabled={isUploading} /> : <></>}
                                                        {!isMultipleFilesSelected ? <textarea placeholder="Caption" value={caption} onChange={(e) => updateCaption(e.target.value)} disabled={isUploading} /> : <></>}

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


UploadPage.propTypes = {
        variant: PropTypes.string.isRequired,
};
