const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const router = express.Router();

/**
 * Fetches vehicle data from the Swedish vehicle registry
 * @route POST /fetchVehicleData
 * @param {string} registrationNumber - The vehicle registration number
 */
router.post("/fetchVehicleData", async (req, res) => {
  const { registrationNumber } = req.body;
  const username = "k3mp3"; // Consider moving this to environment variables

  try {
    // Remove space from registration number
    const formattedRegNumber = registrationNumber.replace(/\s/g, "");

    // The API expects form-encoded data for POST requests
    const params = new URLSearchParams();
    params.append("RegistrationNumber", formattedRegNumber);
    params.append("username", username);

    const response = await axios({
      method: "post",
      url: "https://www.registreringsnummerapi.se/api/reg.asmx/CheckSweden",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: params,
    });

    // Parse XML response
    const parser = new xml2js.Parser({ explicitArray: false });
    const parsedData = await parser.parseStringPromise(response.data);

    // Extract vehicle data from the parsed XML
    const vehicleData = parsedData.Vehicle;
    console.log({ vehicleData: vehicleData });

    // Parse the JSON string in vehicleJson if it exists
    let additionalData = {};
    if (vehicleData.vehicleJson) {
      try {
        additionalData = JSON.parse(vehicleData.vehicleJson);
        console.log({ additionalData: additionalData });
      } catch (e) {
        console.warn("Could not parse vehicleJson:", e);
      }
    }

    // Extract the relevant data, checking both XML structure and JSON data
    const extractedData = {
      make:
        vehicleData?.vehicleData?.CarMake?.CurrentTextValue ||
        additionalData?.make ||
        null,
      model:
        vehicleData?.vehicleData?.CarModel || additionalData?.model || null,
      modelDescription:
        vehicleData?.vehicleData?.ModelDescription ||
        additionalData?.modelDescription ||
        null,
      registrationYear:
        vehicleData?.vehicleData?.RegistrationYear ||
        additionalData?.year ||
        null,
      fuelType:
        vehicleData?.vehicleData?.FuelType?.CurrentTextValue ||
        additionalData?.fuel ||
        null,
      transmission:
        vehicleData?.vehicleData?.Transmission?.CurrentTextValue ||
        additionalData?.Transmission ||
        null,
      engineSize:
        vehicleData?.vehicleData?.EngineSize?.CurrentTextValue ||
        additionalData?.engineSize ||
        null,
      power: additionalData?.power || null,
      drive: additionalData?.drive || null, // 2WD, 4WD etc if available
    };

    // Return the formatted data
    res.json({
      success: true,
      data: extractedData,
      raw: vehicleData, // Include raw data for debugging
    });
  } catch (error) {
    console.error("Vehicle data fetch error:", error);

    res.status(500).json({
      success: false,
      error: "Could not fetch vehicle data",
      details: error.message,
    });
  }
});

module.exports = router;
