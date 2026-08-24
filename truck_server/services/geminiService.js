import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const generateForecast = async ({
  origin,
  destination,
  vesselType,
  cargoQuantity,
  forecastPeriod,
  compatiblePorts,
  restrictedPorts,
}) => {
  const compatibleNames = compatiblePorts
    .map((p) => p.name)
    .join(", ");

  const restrictedNames = restrictedPorts
    .map((p) => p.name)
    .join(", ");

  const prompt = `
You are an expert maritime freight procurement analyst.

Analyze the following bulk cargo chartering scenario.

Origin:
${origin}

Destination:
${destination}

Vessel Type:
${vesselType}

Cargo Quantity:
${cargoQuantity} MT

Forecast Period:
${forecastPeriod}

Compatible East Coast Ports:
${compatibleNames || "None"}

Restricted East Coast Ports:
${restrictedNames || "None"}

Provide a practical chartering recommendation.

IMPORTANT:
- Do not claim to have access to live freight market prices.
- Do not invent real historical market data.
- Treat rate values as indicative estimates only.
- Focus on reasoning, risk, vessel suitability and charter timing.

Return ONLY valid JSON in this exact structure:

{
  "marketTrend": "Increasing | Stable | Decreasing",
  "riskLevel": "Low | Medium | High",
  "estimatedRate": 0,
  "rateUnit": "USD/tonne",
  "charterAdvice": "",
  "reasoning": "",
  "keyFactors": [
    "",
    "",
    ""
  ],
  "rateData": [
    {
      "month": "",
      "historicalRate": null,
      "projectedRate": 0
    }
  ]
}

Generate 6 monthly points for rateData.
Use null for historicalRate where appropriate.
Use reasonable indicative values rather than presenting them as actual market prices.
`;

  const result = await model.generateContent(prompt);

  const text = result.response.text();

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};