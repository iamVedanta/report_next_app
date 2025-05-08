"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// Dynamic import of the map component (no SSR)
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

// Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const searchParams = useSearchParams();
  const userID =
    searchParams.get("userID") || "00000000-0000-0000-0000-000000000000";

  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLatLng({ lat: latitude, lng: longitude });
        },
        () => {
          setCurrentLocation({ lat: 20, lng: 78 });
          setLatLng({ lat: 20, lng: 78 });
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
    );
    const data = await res.json();
    setSearchResults(data);
  };

  const handleSelectPlace = (place: any) => {
    setLatLng({ lat: parseFloat(place.lat), lng: parseFloat(place.lon) });
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!latLng || !description || !userID) {
      alert("Please fill in all fields");
      return;
    }

    const { error } = await supabase.from("CrimeDB").insert([
      {
        user_id: userID,
        latt: latLng.lat,
        long: latLng.lng,
        description,
      },
    ]);

    if (error) {
      alert("Error submitting data");
      console.error(error);
    } else {
      alert("Data submitted successfully");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto font-sans flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-center">Submit Report</h2>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a place"
        className="w-full border border-gray-300 rounded-md p-2"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Search
      </button>

      {searchResults.length > 0 && (
        <ul className="border rounded-md max-h-40 overflow-y-auto">
          {searchResults.map((place, idx) => (
            <li
              key={idx}
              onClick={() => handleSelectPlace(place)}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}

      {/* Dynamically imported map */}
      <MapComponent
        latLng={latLng}
        setLatLng={setLatLng}
        currentLocation={currentLocation}
      />

      {latLng && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Latitude: {latLng.lat}</p>
          <p>Longitude: {latLng.lng}</p>
        </div>
      )}

      <textarea
        placeholder="Enter description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 h-24"
      />

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  );
}
