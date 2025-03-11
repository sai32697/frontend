import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapComponent = () => {
    const [busLocation, setBusLocation] = useState({ lat: 0, lon: 0 });
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        // Initialize the map **only once**
        if (!mapRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [busLocation.lon, busLocation.lat],
                zoom: 14,
            });

            // Create a marker
            markerRef.current = new mapboxgl.Marker().setLngLat([busLocation.lon, busLocation.lat]).addTo(mapRef.current);
        }
    }, []); // ✅ Ensures the map initializes only once

    useEffect(() => {
        // Function to fetch the latest GPS location from the backend
        const fetchLocation = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/get_location`);
                if (res.data && res.data.lat && res.data.lon) {
                    setBusLocation({ lat: res.data.lat, lon: res.data.lon });
                }
            } catch (error) {
                console.error("Error fetching bus location", error);
            }
        };

        fetchLocation(); // Initial fetch
        const interval = setInterval(fetchLocation, 5000); // Fetch every 5 seconds

        return () => clearInterval(interval);
    }, [setBusLocation]); // ✅ Fix: Use setBusLocation to prevent unnecessary re-renders

    useEffect(() => {
        if (mapRef.current && markerRef.current) {
            markerRef.current.setLngLat([busLocation.lon, busLocation.lat]);
            mapRef.current.flyTo({ center: [busLocation.lon, busLocation.lat], essential: true });
        }
    }, [busLocation]); // ✅ Updates only when busLocation changes

    return (
        <div>
            <h1>🚌 Live Bus Tracker</h1>
            <div ref={mapContainerRef} style={{ width: "100vw", height: "100vh" }} />
        </div>
    );
};

export default MapComponent;