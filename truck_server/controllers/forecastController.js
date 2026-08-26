import { analyzePorts } from "../services/portService.js";
import { generateForecast } from "../services/geminiService.js";

export const createForecast = async (req, res) => {
  try {
    const {
      origin,
      destination,
      vesselType,
      cargoQuantity,
      forecastPeriod,
    } = req.body;

    if (
      !origin ||
      !destination ||
      !vesselType ||
      !cargoQuantity ||
      !forecastPeriod
    ) {
      return res.status(400).json({
        message: "All forecast fields are required.",
      });
    }

    const portAnalysis = analyzePorts(vesselType);

    const forecast = await generateForecast({
      origin,
      destination,
      vesselType,
      cargoQuantity,
      forecastPeriod,
      compatiblePorts: portAnalysis.compatiblePorts,
      restrictedPorts: portAnalysis.restrictedPorts,
    });

    res.json({
      query: {
        origin,
        destination,
        vesselType,
        cargoQuantity,
        forecastPeriod,
      },

      vessel: portAnalysis.vessel,

      ports: {
        all: portAnalysis.portResults,
        compatible: portAnalysis.compatiblePorts,
        restricted: portAnalysis.restrictedPorts,
        special: portAnalysis.specialPorts,
      },

      forecast,

      rateData: forecast.rateData || [],
    });
  } catch (error) {
    console.error("Forecast Error:", error);

    res.status(500).json({
      message: "Failed to generate forecast.",
      error: error.message,
    });
  }
};
