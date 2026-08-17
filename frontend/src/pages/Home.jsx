import React from "react";
import PhotoBoard from "../components/PhotoBoard";
import { useNavigate } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import PageBanner from "../components/PageBanner";

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
                        <PageBanner title={"Gaby&apos;s Corkboard"} nextPageName={"Upload"} goToNextPage={goToUploadPage} />
                        <main className="home-main">
                                {isFetchingPhotos && <div className="spinner" style={{ margin: "4rem auto" }}></div>}
                                {!isFetchingPhotos && <PhotoBoard photos={transformedPhotos} />}
                        </main>
                </div>
        );
}
