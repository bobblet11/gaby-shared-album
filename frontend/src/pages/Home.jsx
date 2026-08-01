import React, { useEffect, useState } from "react";
import PhotoBoard from "../components/PhotoBoard";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER_PHOTOS = [
        {
                id: 1,
                title: "Beach Day",
                date: "2026-05-20",
                caption: "Sunset in Hong Kong",
                image_endpoint: "https://picsum.photos/400/400?random=1",
                placeholder_endpoint: "https://picsum.photos/100/100?random=101",
        },
        {
                id: 2,
                title: "Coffee Time",
                date: "2026-05-19",
                caption: "Morning brew",
                image_endpoint: "https://picsum.photos/400/400?random=2",
                placeholder_endpoint: "https://picsum.photos/100/100?random=102",
        },
        {
                id: 3,
                title: "City Walk",
                date: "2026-05-18",
                caption: "Exploring streets",
                image_endpoint: "https://picsum.photos/400/400?random=3",
                placeholder_endpoint: "https://picsum.photos/100/100?random=103",
        },
        {
                id: 4,
                title: "Mountain View",
                date: "2026-05-17",
                caption: "Hiking adventure",
                image_endpoint: "https://picsum.photos/400/400?random=4",
                placeholder_endpoint: "https://picsum.photos/100/100?random=104",
        },
        {
                id: 5,
                title: "Coffee Shop",
                date: "2026-05-16",
                caption: "Cozy corner",
                image_endpoint: "https://picsum.photos/400/400?random=5",
                placeholder_endpoint: "https://picsum.photos/100/100?random=105",
        },
        {
                id: 6,
                title: "Night Sky",
                date: "2026-05-15",
                caption: "Starry night",
                image_endpoint: "https://picsum.photos/400/400?random=6",
                placeholder_endpoint: "https://picsum.photos/100/100?random=106",
        },
        {
                id: 7,
                title: "Park Picnic",
                date: "2026-05-14",
                caption: "Sunday chill",
                image_endpoint: "https://picsum.photos/400/400?random=7",
                placeholder_endpoint: "https://picsum.photos/100/100?random=107",
        },
        {
                id: 8,
                title: "Book Store",
                date: "2026-05-13",
                caption: "Found great books",
                image_endpoint: "https://picsum.photos/400/400?random=8",
                placeholder_endpoint: "https://picsum.photos/100/100?random=108",
        },
        {
                id: 9,
                title: "Food Market",
                date: "2026-05-12",
                caption: "Delicious snacks",
                image_endpoint: "https://picsum.photos/400/400?random=9",
                placeholder_endpoint: "https://picsum.photos/100/100?random=109",
        },
        {
                id: 10,
                title: "Train Ride",
                date: "2026-05-11",
                caption: "Travel mode",
                image_endpoint: "https://picsum.photos/400/400?random=10",
                placeholder_endpoint: "https://picsum.photos/100/100?random=110",
        },
        {
                id: 11,
                title: "Garden",
                date: "2026-05-10",
                caption: "Flowers blooming",
                image_endpoint: "https://picsum.photos/400/400?random=11",
                placeholder_endpoint: "https://picsum.photos/100/100?random=111",
        },
        {
                id: 12,
                title: "Art Gallery",
                date: "2026-05-09",
                caption: "Beautiful paintings",
                image_endpoint: "https://picsum.photos/400/400?random=12",
                placeholder_endpoint: "https://picsum.photos/100/100?random=112",
        },
        {
                id: 13,
                title: "Rooftop",
                date: "2026-05-08",
                caption: "Skyline view",
                image_endpoint: "https://picsum.photos/400/400?random=13",
                placeholder_endpoint: "https://picsum.photos/100/100?random=113",
        },
        {
                id: 14,
                title: "Bakery",
                date: "2026-05-07",
                caption: "Fresh pastries",
                image_endpoint: "https://picsum.photos/400/400?random=14",
                placeholder_endpoint: "https://picsum.photos/100/100?random=114",
        },
        {
                id: 15,
                title: "River Side",
                date: "2026-05-06",
                caption: "Peaceful water",
                image_endpoint: "https://picsum.photos/400/400?random=15",
                placeholder_endpoint: "https://picsum.photos/100/100?random=115",
        },
        {
                id: 16,
                title: "Office Day",
                date: "2026-05-05",
                caption: "Work vibes",
                image_endpoint: "https://picsum.photos/400/400?random=16",
                placeholder_endpoint: "https://picsum.photos/100/100?random=116",
        },
        {
                id: 17,
                title: "Gym Time",
                date: "2026-05-04",
                caption: "Leg day",
                image_endpoint: "https://picsum.photos/400/400?random=17",
                placeholder_endpoint: "https://picsum.photos/100/100?random=117",
        },
        {
                id: 18,
                title: "Movie Night",
                date: "2026-05-03",
                caption: "Just watched a film",
                image_endpoint: "https://picsum.photos/400/400?random=18",
                placeholder_endpoint: "https://picsum.photos/100/100?random=118",
        },
        {
                id: 19,
                title: "Street Food",
                date: "2026-05-02",
                caption: "Yummy noodles",
                image_endpoint: "https://picsum.photos/400/400?random=19",
                placeholder_endpoint: "https://picsum.photos/100/100?random=119",
        },
        {
                id: 20,
                title: "Library",
                date: "2026-05-01",
                caption: "Quiet reading",
                image_endpoint: "https://picsum.photos/400/400?random=20",
                placeholder_endpoint: "https://picsum.photos/100/100?random=120",
        },
        {
                id: 21,
                title: "Bike Ride",
                date: "2026-04-30",
                caption: "Cycling around",
                image_endpoint: "https://picsum.photos/400/400?random=21",
                placeholder_endpoint: "https://picsum.photos/100/100?random=121",
        },
        {
                id: 22,
                title: "Sunset",
                date: "2026-04-29",
                caption: "Amazing colors",
                image_endpoint: "https://picsum.photos/400/400?random=22",
                placeholder_endpoint: "https://picsum.photos/100/100?random=122",
        },
        {
                id: 23,
                title: "Dinner",
                date: "2026-04-28",
                caption: "Fine dining",
                image_endpoint: "https://picsum.photos/400/400?random=23",
                placeholder_endpoint: "https://picsum.photos/100/100?random=123",
        },
        {
                id: 24,
                title: "Museum",
                date: "2026-04-27",
                caption: "History lesson",
                image_endpoint: "https://picsum.photos/400/400?random=24",
                placeholder_endpoint: "https://picsum.photos/100/100?random=124",
        },
        {
                id: 25,
                title: "Rainy Day",
                date: "2026-04-26",
                caption: "Cozy inside",
                image_endpoint: "https://picsum.photos/400/400?random=25",
                placeholder_endpoint: "https://picsum.photos/100/100?random=125",
        },
        {
                id: 26,
                title: "Beach Walk",
                date: "2026-04-25",
                caption: "Sand between toes",
                image_endpoint: "https://picsum.photos/400/400?random=26",
                placeholder_endpoint: "https://picsum.photos/100/100?random=126",
        },
        {
                id: 27,
                title: "Concert",
                date: "2026-04-24",
                caption: "Live music",
                image_endpoint: "https://picsum.photos/400/400?random=27",
                placeholder_endpoint: "https://picsum.photos/100/100?random=127",
        },
        {
                id: 28,
                title: "Cat",
                date: "2026-04-23",
                caption: "Cute kitty",
                image_endpoint: "https://picsum.photos/400/400?random=28",
                placeholder_endpoint: "https://picsum.photos/100/100?random=128",
        },
        {
                id: 29,
                title: "Dog",
                date: "2026-04-22",
                caption: "Good boy",
                image_endpoint: "https://picsum.photos/400/400?random=29",
                placeholder_endpoint: "https://picsum.photos/100/100?random=129",
        },
        {
                id: 30,
                title: "Friends",
                date: "2026-04-21",
                caption: "Best times",
                image_endpoint: "https://picsum.photos/400/400?random=30",
                placeholder_endpoint: "https://picsum.photos/100/100?random=130",
        },
];

export default function HomePage() {
        const API_URL = process.env.REACT_APP_API_URL;
        const USE_API_URL = process.env.REACT_APP_FEATURE_FLAG === "true";
        const [photos, setPhotos] = useState([]);

        useEffect(() => {
                const loadPhotos = async () => {
                        if (!USE_API_URL || !API_URL) {
                                setPhotos(PLACEHOLDER_PHOTOS);
                        } else {
                                const res = await fetch(`${API_URL}/api/photo`);
                                const data = await res.json();
                                setPhotos(data);
                        }
                };
                loadPhotos();
        }, [API_URL, USE_API_URL]);

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
                                <div className="title-card">Gaby's Corkboard</div>
                                <button className="upload-button" onClick={goToUploadPage}>
                                        Upload
                                </button>
                        </header>

                        <main className="home-main">
                                <PhotoBoard photos={photos} />
                        </main>
                </div>
        );
}
