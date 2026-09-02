import Address from "../models/Address.js";

/**
 * Save a new address
 * POST /api/addresses
 */
export const saveAddress = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { label, fullAddress, lat, lng, placeId } = req.body;

    if (!label || !fullAddress || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const address = await Address.create({
      userId,
      label,
      fullAddress,
      lat,
      lng,
      placeId,
    });

    res.status(201).json(address);
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all addresses for logged-in user
 * GET /api/addresses
 */
export const getMyAddresses = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const addresses = await Address.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(addresses);
  } catch (error) {
    console.error("Fetch addresses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
