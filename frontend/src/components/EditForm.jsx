import React from "react";
import PropTypes from "prop-types";
import Spinner from "./Spinner";

export default function EditForm({ variant = "default", style, isUploading, openPhoto, onExitEdit, handleEditSubmit, editDraft, isDirty, updateTitle, updateCaption }) {
        return (
                <div className="upload-card" onClick={(e) => e.stopPropagation()}>
                        <div className="upload-header">
                                <h1>{`Edit image ${openPhoto.title}`}</h1>
                                <button type="button" className="close-btn" onClick={onExitEdit} disabled={isUploading} aria-label="Close edit panel">
                                        ×
                                </button>
                        </div>
                        <form className="edit-form" style={style} onSubmit={handleEditSubmit}>
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
                                                <div className="upload-inputs">
                                                        <input type="text" placeholder="Title" value={editDraft.title} onChange={(e) => updateTitle(e)} disabled={isUploading} />
                                                        <textarea placeholder="Caption" value={editDraft.caption} onChange={(e) => updateCaption(e)} disabled={isUploading} />
                                                </div>

                                                <button type="submit" disabled={isUploading || !isDirty}>
                                                        Submit edit
                                                </button>
                                        </>
                                )}
                        </form>
                </div>
        );
}

EditForm.propTypes = {
        variant: PropTypes.string,
        style: PropTypes.object,
        isUploading: PropTypes.bool.isRequired,
        openPhoto: PropTypes.shape({
                title: PropTypes.string.isRequired,
                caption: PropTypes.string.isRequired,
                image_src: PropTypes.string.isRequired,
        }).isRequired,
        onExitEdit: PropTypes.func.isRequired,
        handleEditSubmit: PropTypes.func.isRequired,
        editDraft: PropTypes.shape({
                title: PropTypes.string.isRequired,
                caption: PropTypes.string.isRequired,
                image_src: PropTypes.string.isRequired,
        }).isRequired,
        isDirty: PropTypes.bool.isRequired,
        updateTitle: PropTypes.func.isRequired,
        updateCaption: PropTypes.func.isRequired,
};
