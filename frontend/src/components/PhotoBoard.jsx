import React, { useRef } from "react";
import Photo from "./Photo";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PropTypes from "prop-types";
import { usePhotoActions } from "../hooks/usePhotoActions";
import { usePhotoDetail } from "../hooks/usePhotoDetail";
import Spinner from "./Spinner";

export default function PhotoBoard({ photos = [], variant = "default" }) {
        const boardRef = useRef(null);

        const { openPhoto, editDraft, isEditingPhoto, isDirty, onOpenPhoto, onClosePhoto, onEnterEdit, onExitEdit, updateTitle, updateCaption } = usePhotoDetail();
        const { isUploading, isDeleting, isDownloading, handleDelete, handleEditSubmit, handleDownload } = usePhotoActions(openPhoto, editDraft);
        return (
                <>
                        {openPhoto && (
                                <div
                                        className={`photo-modal-backdrop ${variant}`}
                                        onClick={() => {
                                                if (!(isEditingPhoto || isUploading || isDeleting || isDownloading)) onClosePhoto();
                                        }}
                                >
                                        {(isDeleting || isDownloading) && (
                                                <div className={`spinner-overlay ${variant}`}>
                                                        <Spinner
                                                                variant={variant}
                                                                style={{
                                                                        width: "10vw",
                                                                        height: "10vw",
                                                                }}
                                                        />
                                                </div>
                                        )}

                                        {isEditingPhoto && editDraft && (
                                                <div className={`photo-modal-backdrop ${variant}`} onClick={() => isEditingPhoto && !isUploading && onExitEdit()}>
                                                        <div className="upload-card" onClick={(e) => e.stopPropagation()}>
                                                                <div className="upload-header">
                                                                        <h1>{`Edit image ${openPhoto.title}`}</h1>
                                                                        <button type="button" className="close-btn" onClick={onExitEdit} disabled={isUploading} aria-label="Close edit panel">
                                                                                ×
                                                                        </button>
                                                                </div>
                                                                {isUploading && <Spinner variant={variant} style={{ margin: "4rem auto" }} />}
                                                                {!isUploading && (
                                                                        <form className="upload-form" onSubmit={handleEditSubmit}>
                                                                                <input type="text" placeholder="Title" value={editDraft.title} onChange={(e) => updateTitle(e)} disabled={isUploading} />

                                                                                <textarea placeholder="Caption" value={editDraft.caption} onChange={(e) => updateCaption(e)} disabled={isUploading} />

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
                                                                <img className="photo-modal-image" src={openPhoto.image_src} alt={openPhoto.title} />
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
                                                        <button className="photo-modal-edit" onClick={onEnterEdit} disabled={isUploading || isDeleting || isDownloading}>
                                                                <i className="fas fa-edit" aria-hidden="true"></i>
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        )}

                        <div ref={boardRef} className={`photo-board ${variant}`}>
                                {photos.map((photo) => (
                                        <Photo key={photo.id} {...photo} onOpenPhoto={onOpenPhoto} />
                                ))}
                        </div>
                </>
        );
}

PhotoBoard.propTypes = {
        photos: PropTypes.arrayOf(
                PropTypes.shape({
                        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
                        title: PropTypes.string.isRequired,
                        date: PropTypes.string, // or PropTypes.instanceOf(Date) if you pass Date objects
                        caption: PropTypes.string,
                        image_src: PropTypes.string.isRequired,
                        placeholder_src: PropTypes.string,
                        rotation: PropTypes.number.isRequired,
                        size: PropTypes.number.isRequired,
                        zIndex: PropTypes.number.isRequired,
                        offsetX: PropTypes.number.isRequired,
                        offsetY: PropTypes.number.isRequired,
                }),
        ).isRequired,
        variant: PropTypes.string,
};
