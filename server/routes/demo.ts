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
    // console.log('📤 Proxying request to external API:', req.body);

    const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/get-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    // console.log('📊 External API response:', data);

    res.status(response.status).json(data);
  } catch (error) {

    res.status(500).json({
      response: false,
      error: 'Failed to fetch plans from external API',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleProcessPayment: RequestHandler = async (req, res) => {
  try {

    const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();


    res.status(response.status).json(data);
  } catch (error) {

    res.status(500).json({
      response: false,
      error: 'Failed to process payment via external API',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleGetServicesList: RequestHandler = async (req, res) => {
  try {
    const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/get-services-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      response: false,
      error: 'Failed to fetch services from external API',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleCalculateCustomPlan: RequestHandler = async (req, res) => {
  try {
    const { selectedServices, applicationTypeId } = req.body;

    if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
      return res.status(400).json({
        response: false,
        error: 'Selected services are required',
        message: 'Please provide an array of selected services'
      });
    }

    // Calculate total monthly price from selected services
    // Note: services API returns daily prices, so we multiply by 30 to get monthly price
    const totalDailyPrice = selectedServices.reduce((total: number, service: any) => {
      const dailyPrice = parseFloat(service.external_price_per_user || service.price || "0");
      return total + dailyPrice;
    }, 0);

    // Convert daily price to monthly price (daily * 30)
    const totalMonthlyPrice = totalDailyPrice * 30;

    // For yearly calculation: monthly * 12 * discount / 12 = monthly * discount
    const yearlyMonthlyPrice = totalMonthlyPrice * 0.8; // 20% discount
    const sixMonthlyPrice = totalMonthlyPrice * 0.9;    // 10% discount  
    const quarterlyPrice = totalMonthlyPrice * 0.95;    // 5% discount

    // Create plan details with different tenure discounts
    const planDetails = [
      {
        id: 1,
        plan_name: "Custom Plan",
        duration: "monthly",
        base_price_per_user: totalMonthlyPrice.toFixed(2),
        base_price_per_user_external: totalMonthlyPrice.toFixed(2),
        discount: "0",
        min_users: 1,
        max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
        trial_days: 7,
        base_price_per_external_user_per_month: totalMonthlyPrice
      },
      {
        id: 2,
        plan_name: "Custom Plan",
        duration: "quaterly",
        base_price_per_user: quarterlyPrice.toFixed(2), // 5% discount
        base_price_per_user_external: quarterlyPrice.toFixed(2),
        discount: "5",
        min_users: 1,
        max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
        trial_days: 7,
        base_price_per_external_user_per_month: quarterlyPrice
      },
      {
        id: 3,
        plan_name: "Custom Plan",
        duration: "half_yearly",
        base_price_per_user: sixMonthlyPrice.toFixed(2), // 10% discount
        base_price_per_user_external: sixMonthlyPrice.toFixed(2),
        discount: "10",
        min_users: 1,
        max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
        trial_days: 7,
        base_price_per_external_user_per_month: sixMonthlyPrice
      },
      {
        id: 4,
        plan_name: "Custom Plan",
        duration: "yearly",
        base_price_per_user: yearlyMonthlyPrice.toFixed(2), // 20% discount
        base_price_per_user_external: yearlyMonthlyPrice.toFixed(2),
        discount: "20",
        min_users: 1,
        max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
        trial_days: 7,
        base_price_per_external_user_per_month: yearlyMonthlyPrice
      }
    ];

    // Create the custom plan structure
    const customPlan = {
      plan_name: "Custom Plan",
      plan_id: 999, // Use a unique ID for custom plans
      features_list: selectedServices.map((service: any) => service.generic_name || service.name),
      plan_details: planDetails
    };

    res.status(200).json({
      response: true,
      data: customPlan,
      message: 'Custom plan calculated successfully'
    });

  } catch (error) {
    res.status(500).json({
      response: false,
      error: 'Failed to calculate custom plan pricing',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};