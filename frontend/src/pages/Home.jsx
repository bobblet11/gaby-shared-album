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
                <div className="page home-page">
                        {/* <PageBanner title="Gaby&apos;s Corkboard" nextPageName="Upload" goToNextPage={goToUploadPage} variant="default"/> */}
                        <PageBanner title="Gaby's Photo App" nextPageName="Upload" goToNextPage={goToUploadPage} variant={variant} />

                        <main className="home-main">
                                {isFetchingPhotos && (
                                        <div
                                                style={{
                                                        position: "fixed",
                                                        inset: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        zIndex: 10000,
                                                        background: "rgba(0,0,0,0)", // optional transparent overlay
                                                }}
                                        >
                                                <Spinner variant={variant} />
                                        </div>
                                )}
                                {!isFetchingPhotos && <PhotoBoard photos={transformedPhotos} variant={variant} />}
                        </main>
                </div>
        );
}


HomePage.propTypes = {
        variant: PropTypes.string.isRequired,
};
