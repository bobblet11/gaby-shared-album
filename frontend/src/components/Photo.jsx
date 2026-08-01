import React, { useState } from "react";


export default function Photo({ id, title, date, caption, image_endpoint, placeholder_endpoint, rotation = 0, size = 1, offsetX = 0, offsetY = 0, onOpenPhoto }) {
        const [isLoaded, setIsLoaded] = useState(false);
        
        const API_URL = process.env.REACT_APP_API_URL;

        function resolvePhotoUrl(value) {
              // If it starts with http:// or https://, treat as full URL
              if (/^https?:\/\//i.test(value)) {
                return value;
              }
              // Otherwise, assume it's an endpoint and prepend API_URL
              return `${API_URL}/media/${value}`;
        }

        const checkedImageUrl = resolvePhotoUrl(image_endpoint);
        const checkedPlaceholderUrl = resolvePhotoUrl(placeholder_endpoint);

        return (
                <div
                        className="photo-card"
                        style={{
                                zIndex: 1,
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
                                        checkedImageUrl,
                                        image_endpoint,
                                        placeholder_endpoint,
                                };
                                onOpenPhoto(photo);
                        }}
                        role="button"
                        tabIndex={0}
                >
                        <div className="photo-inner">
                                <div className="photo-image-wrap">
                                        {checkedPlaceholderUrl && !isLoaded && <img className="photo-image photo-placeholder" src={checkedPlaceholderUrl} alt={title} />}
                                        <img className="photo-image" src={checkedImageUrl} alt={title} loading="lazy" onLoad={() => setIsLoaded(true)} />
                                        <div className="photo-filter" />
                                </div>

                                <div className="photo-caption">
                                        <div className="photo-title">{title}</div>
                                        <div className="photo-date">{date}</div>
                                        <div className="photo-text">{caption}</div>
                                </div>
                        </div>
                </div>
        );
}
