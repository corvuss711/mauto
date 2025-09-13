import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};

export const handleGetPlans: RequestHandler = async (req, res) => {
  try {
    console.log('📤 Proxying request to external API:', req.body);

    const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/get-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('📊 External API response:', data);

    res.status(response.status).json(data);
  } catch (error) {
    console.error('❌ Error proxying to external API:', error);
    res.status(500).json({
      response: false,
      error: 'Failed to fetch plans from external API',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
