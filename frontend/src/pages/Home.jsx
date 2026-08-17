import React from "react";
import PhotoBoard from "../components/PhotoBoard";
import { useNavigate } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import PageBanner from "../components/PageBanner";
import Spinner from "../components/Spinner";
import PropTypes from "prop-types";

export default function HomePage({ variant = "default" }) {
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
                        {/* <PageBanner title="Gaby&apos;s Corkboard" nextPageName="Upload" goToNextPage={goToUploadPage} variant="default"/> */}
                        <PageBanner title="Happy Anniversary 💖" nextPageName="Upload" goToNextPage={goToUploadPage} variant={variant} />

                        <main className="home-main">
                                {isFetchingPhotos && <Spinner variant={variant} style={{ margin: "4rem auto" }} />}
                                {!isFetchingPhotos && <PhotoBoard photos={transformedPhotos} variant={variant} />}
                        </main>
                </div>
        );
}


HomePage.propTypes = {
        variant: PropTypes.string.isRequired,
};
