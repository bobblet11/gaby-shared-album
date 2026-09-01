import React from "react";
import { useNavigate } from "react-router-dom";
import { usePhotoUpload } from "../hooks/usePhotosUpload";
import PageBanner from "../components/PageBanner.jsx";
import PropTypes from "prop-types";
import UploadForm from "../components/UploadForm.jsx";


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
                <div className="page upload-page">
                        {/* <PageBanner title="Gaby&apos;s Corkboard" nextPageName="Home" goToNextPage={goToHomePage} variant="anniversary"/> */}
                        <PageBanner title="Gaby's Photo App" nextPageName="Home" goToNextPage={goToHomePage} variant={variant} />
                        <main className="upload-main">
                                <UploadForm variant={variant} handleSubmit={handleSubmit} isUploading={isUploading} isMultipleFilesSelected={isMultipleFilesSelected} dragOver={dragOver} onFileDrop={onFileDrop} onFileDragOver={onFileDragOver} onFileDragLeave={onFileDragLeave} onSelectedFilesChange={onSelectedFilesChange} previewUrls={previewUrls} updateTitle={updateTitle} updateCaption={updateCaption} title={title} caption={caption} />
                        </main>
                </div>
        );
}

UploadPage.propTypes = {
        variant: PropTypes.string.isRequired,
};
