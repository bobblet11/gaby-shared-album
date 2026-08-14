import React, { useState } from "react";
import PropTypes from "prop-types";

export default function Photo({ id, title, caption, upload_date, image_src, placeholder_src, account_id, rotation = 0, size = 1, zIndex=1000, offsetX = 0, offsetY = 0, onOpenPhoto }) {
        const [isLoaded, setIsLoaded] = useState(false);
        return (
                <div
                        className="photo-card"
                        style={{
                                zIndex: `${zIndex}`,
                                cursor: "pointer",
                                userSelect: "none",
                                transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${size})`,
                                transition: "transform 0.2s ease",
                        }}
                        onClick={() => {
                                if (!isLoaded) {
                                        return;
                                }

                                const photo = {
                                        id,
                                        title,
                                        caption,
                                        image_src,
                                        placeholder_src,
                                };

                                onOpenPhoto(photo);
                        }}
                        role="button"
                        tabIndex={0}
                >
                        <div className="photo-inner">
                                <div className="photo-image-wrap">
                                        {placeholder_src && !isLoaded && <img className="photo-image photo-placeholder" src={placeholder_src} alt={title} />}
                                        <img className="photo-image" src={image_src} alt={title} loading="lazy" onLoad={() => setIsLoaded(true)} />
                                        <div className="photo-filter" />
                                </div>

                                <div className="photo-caption">
                                        <div className="photo-title">{title}</div>
                                        <div className="photo-date">{upload_date}</div>
                                        <div className="photo-text">{caption}</div>
                                </div>
                        </div>
                </div>
        );
}



Photo.propTypes = {
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string, // or PropTypes.instanceOf(Date) if you pass Date objects
        caption: PropTypes.string,
        image_endpoint: PropTypes.string.isRequired,
        placeholder_endpoint: PropTypes.string,
        rotation: PropTypes.number,
        size: PropTypes.number,
        offsetX: PropTypes.number,
        offsetY: PropTypes.number,
        onOpenPhoto: PropTypes.func.isRequired,
};
