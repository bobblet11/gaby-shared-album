import React from "react";
import PhotoBoard from "../components/PhotoBoard";
import { useNavigate } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";

export default function HomePage() {
        const { transformedPhotos, isFetchingPhotos } = usePhotos();

        const navigate = useNavigate();

        const goToUploadPage = () => {
                try {
                        navigate("/upload");
                } catch (error) {
                        console.error("Navigation error:", error);
                }
        };

        return (
                <div className="home-page">
                        <header className="top-banner">
                                <div className="title-card">Gaby&apos;s Corkboard</div>
                                <button className="upload-button" onClick={goToUploadPage}>
                                        Upload
                                </button>
                        </header>
                        <main className="home-main">
                                {isFetchingPhotos && <div className="spinner" style={{ margin: "4rem auto" }}></div>}
                                {!isFetchingPhotos && <PhotoBoard photos={transformedPhotos} />}
                        </main>
                </div>
        );
}
