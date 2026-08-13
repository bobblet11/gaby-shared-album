import { useState, useEffect, useMemo } from "react";
import PLACEHOLDER_PHOTOS from "../assets/placeholderPhotos";
import { getAllPhotos } from "../api/photos.js";
import config from "../configs/config";

export function usePhotos() {
        const [photos, setPhotos] = useState([]);
        const [isFetchingPhotos, setIsFetchingPhotos] = useState(true);
        const rand = (min, max) => {
                return Math.random() * (max - min) + min;
        };

        useEffect(() => {
                const loadPhotos = async () => {
                        setIsFetchingPhotos(true);

                        if (!config.api.use_api || !config.api.domain) {
                                setPhotos(PLACEHOLDER_PHOTOS);
                        } else {
                                const photos = await getAllPhotos();
                                setPhotos(photos);
                        }
                        setIsFetchingPhotos(false);
                };
                loadPhotos();
        }, [config]);

        const transformedPhotos = useMemo(() => {
                const count = photos.length;
                if (count === 0) return [];

                return photos.map((p) => {
                        const offsetX = rand(-3, 3); // ±3px offset
                        const offsetY = rand(-3, 3); // ±3px offset
                        const rotation = rand(-2, 2); // ±2 degrees rotation
                        const size = rand(0.98, 1.02); // ±2% size variation
                        const zIndex = Math.floor(rand(1, 4));

                        return {
                                ...p,
                                rotation,
                                size,
                                zIndex,
                                offsetX,
                                offsetY,
                        };
                });
        }, [photos]);

        return { transformedPhotos, isFetchingPhotos };
}
