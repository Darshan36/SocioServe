import {
  LOCATIONIQ_BASE_URL,
  LOCATIONIQ_COUNTRY,
  LOCATIONIQ_LIMIT
} from "../constants/locationIQ";

export const searchAddressLocationIQ = async (query) => {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(
      `${LOCATIONIQ_BASE_URL}?key=${
        import.meta.env.VITE_LOCATIONIQ_KEY
      }&q=${encodeURIComponent(query)}&limit=${LOCATIONIQ_LIMIT}&countrycodes=${LOCATIONIQ_COUNTRY}&format=json`
    );

    if (!res.ok) {
      console.error("LocationIQ error:", res.status);
      return [];
    }

    return await res.json();
  } catch (err) {
    console.error("LocationIQ fetch failed:", err);
    return [];
  }
};
