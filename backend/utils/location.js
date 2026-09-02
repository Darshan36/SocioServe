export const buildLocation = (req) => {
  const { latitude, longitude } = req.body || {};

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  // If frontend did NOT send location — return null
  if (isNaN(lat) || isNaN(lng)) {
    return {
      type: "Point",
      coordinates: [0, 0],  // fallback default
    };
  }

  return {
    type: "Point",
    coordinates: [lng, lat],
  };
};
