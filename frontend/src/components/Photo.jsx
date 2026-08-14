import React, { useState } from "react";
import PropTypes from "prop-types";

export default function Photo({ id, title, caption, upload_date, image_src, placeholder_src, account_id, rotation = 0, size = 1, zIndex = 1000, offsetX = 0, offsetY = 0, onOpenPhoto }) {
        const [isLoaded, setIsLoaded] = useState(false);
        const datePartOnly = upload_date.split("T")[0];
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
                                        account_id,
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
                                        <div className="photo-date">{datePartOnly}</div>
                                        <div className="photo-text">{caption}</div>
                                </div>
                        </div>
                </div>
        );
}

Photo.propTypes = {
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        caption: PropTypes.string.isRequired,
        upload_date: PropTypes.string.isRequired, // or PropTypes.instanceOf(Date) if you pass Date objects
        image_src: PropTypes.string.isRequired,
        placeholder_src: PropTypes.string.isRequired,
        account_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        rotation: PropTypes.number,
        size: PropTypes.number,
        zIndex: PropTypes.number,
        offsetX: PropTypes.number,
        offsetY: PropTypes.number,
        onOpenPhoto: PropTypes.func.isRequired,
};
