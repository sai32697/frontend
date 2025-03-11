import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    const [busLocation, setBusLocation] = useState({ lat: 0, lon: 0 });
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        // Fetch initial location
        const fetchLocation = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get_location`);
                if (res.data) {
                    setBusLocation({ lat: res.data.lat, lon: res.data.lon });
                }
            } catch (error) {
                console.error("Error fetching bus location", error);
            }
        };

        fetchLocation();

        // Initialize Mapbox only once
        if (!mapRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [busLocation.lon || 0, busLocation.lat || 0],
                zoom: 14,
            });

            new mapboxgl.Marker()
                .setLngLat([busLocation.lon || 0, busLocation.lat || 0])
                .addTo(mapRef.current);
        }

        // Update bus location every 5 seconds
        const interval = setInterval(fetchLocation, 5000);
        return () => clearInterval(interval);

    }, []);

    return (
        <div>
            <h1>🚌 Live Bus Tracker</h1>
            <div ref={mapContainerRef} style={{ width: "100vw", height: "100vh" }} />
        </div>
    );
};

export default MapComponent;