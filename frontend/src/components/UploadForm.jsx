import React from "react";
import PropTypes from "prop-types";
import { config } from "../configs/config";
import Spinner from "./Spinner";

export default function UploadForm({ title, caption, handleSubmit, onSelectedFilesChange, isUploading, isMultipleFilesSelected, dragOver, onFileDrop, onFileDragLeave, onFileDragOver, previewUrls, updateCaption, updateTitle, variant = "default", style }) {
        return (
                <div className="upload-card">
                        <div className="upload-header">
                                <h1>Upload a Polaroid</h1>
                        </div>

                        <form className="upload-form" style={style} onSubmit={handleSubmit}>
                                {isUploading && (
                                        <div
						style={{
							position: "absolute",
							inset: 0,
							display: "flex",
                                                        alignItems: "center",
							justifyContent: "center",
                                                        background: "rgba(0,0,0,0)", // optional transparent overlay
                                                }}
                                        >
                                                <Spinner variant={variant} />
                                        </div>
                                )}
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

                                                {!isMultipleFilesSelected ? (
                                                        <div className="upload-inputs">
                                                                <input type="text" placeholder="Title" value={title} onChange={(e) => updateTitle(e.target.value)} disabled={isUploading} />
                                                                <textarea placeholder="Caption" value={caption} onChange={(e) => updateCaption(e.target.value)} disabled={isUploading} />
                                                        </div>
                                                ) : (
                                                        <></>
                                                )}

                                                <button type="submit" disabled={isUploading}>
                                                        Upload
                                                </button>
                                        </>
                                )}
                        </form>
                </div>
        );
}

UploadForm.propTypes = {
        isUploading: PropTypes.bool.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        isMultipleFilesSelected: PropTypes.bool.isRequired,
        dragOver: PropTypes.bool.isRequired,
        onFileDragLeave: PropTypes.func.isRequired,
        onFileDragOver: PropTypes.func.isRequired,
        onFileDrop: PropTypes.func.isRequired,
        onSelectedFilesChange: PropTypes.func.isRequired,
        previewUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
        updateCaption: PropTypes.func.isRequired,
        updateTitle: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        caption: PropTypes.string.isRequired,

        variant: PropTypes.string,
        style: PropTypes.object,
};
