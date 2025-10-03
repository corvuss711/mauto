import { RequestHandler } from "express";
import { DemoResponse } from "@shared/api";
import fetch from 'node-fetch';

export const handleDemo: RequestHandler = (req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  res.status(200).json(response);
};

export const handleGetPlans: RequestHandler = async (req, res) => {
  try {
    // console.log('📤 Proxying request to external API:', req.body);

    const response = await fetch('https://salesforce.msell.in/public/api/get-plan', {
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

    const response = await fetch('https://salesforce.msell.in/public/api/process-payment', {
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
    const response = await fetch('https://salesforce.msell.in/public/api/get-services-list', {
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
    const { generic_module_id, service_names } = req.body;
    // console.log('[Custom Plan] Received generic_module_id:', generic_module_id);
    // console.log('[Custom Plan] Received service_names:', service_names);

    if (!generic_module_id || !Array.isArray(generic_module_id) || generic_module_id.length === 0) {
      return res.status(400).json({
        response: false,
        error: 'generic_module_id is required',
        message: 'Please provide a valid array of generic_module_id'
      });
    }

    const requestBody = {
      generic_module_id: generic_module_id
    };

    // console.log('[Calculate Custom Plan] Request payload:', requestBody);

    const response = await fetch('https://salesforce.msell.in/public/api/calculate-customized-services-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // console.log('[Calculate Custom Plan] Response status:', response.status);

    const data = await response.json();
    // console.log('[Calculate Custom Plan] Response data:', data);

    if (response.ok && (data as any).status === true) {
      // Transform the response to match our expected format
      const apiData = (data as any).data;

      // Use service names from frontend if available, otherwise use generic names
      const features_list = service_names && service_names.length > 0
        ? service_names
        : generic_module_id.map((id: number) => `Service Module ${id}`);

      const transformedData = {
        plan_name: "Custom Plan",
        plan_id: 999,
        features_list: features_list,
        plan_details: [
          {
            id: 1,
            plan_name: "Custom Plan",
            duration: "monthly",
            base_price_per_user: apiData.monthly.per_month_external.toString(),
            base_price_per_user_external: apiData.monthly.per_month_external.toString(),
            discount: apiData.discount.monthly.discount.toString(),
            discount_label: apiData.discount.monthly.discount_label,
            min_users: 1,
            max_users: Number.MAX_SAFE_INTEGER,
            trial_days: 7,
            base_price_per_external_user_per_month: apiData.monthly.per_month_external
          },
          {
            id: 2,
            plan_name: "Custom Plan",
            duration: "quaterly",
            base_price_per_user: apiData.quaterly.per_month_external.toString(),
            base_price_per_user_external: apiData.quaterly.per_month_external.toString(),
            discount: apiData.discount.quaterly.discount.toString(),
            discount_label: apiData.discount.quaterly.discount_label,
            min_users: 1,
            max_users: Number.MAX_SAFE_INTEGER,
            trial_days: 7,
            base_price_per_external_user_per_month: apiData.quaterly.per_month_external
          },
          {
            id: 3,
            plan_name: "Custom Plan",
            duration: "half_yearly",
            base_price_per_user: apiData.half_yearly.per_month_external.toString(),
            base_price_per_user_external: apiData.half_yearly.per_month_external.toString(),
            discount: apiData.discount.half_yearly.discount.toString(),
            discount_label: apiData.discount.half_yearly.discount_label,
            min_users: 1,
            max_users: Number.MAX_SAFE_INTEGER,
            trial_days: 7,
            base_price_per_external_user_per_month: apiData.half_yearly.per_month_external
          },
          {
            id: 4,
            plan_name: "Custom Plan",
            duration: "yearly",
            base_price_per_user: apiData.yearly.per_month_external.toString(),
            base_price_per_user_external: apiData.yearly.per_month_external.toString(),
            discount: apiData.discount.yearly.discount.toString(),
            discount_label: apiData.discount.yearly.discount_label,
            min_users: 1,
            max_users: Number.MAX_SAFE_INTEGER,
            trial_days: 7,
            base_price_per_external_user_per_month: apiData.yearly.per_month_external
          }
        ],
        // Store the original pricing data for step 3
        pricing_data: apiData
      };

      res.status(200).json({
        response: true,
        data: transformedData,
        message: 'Custom plan calculated successfully'
      });
    } else {
      const errorMessage = (data as any).message || (data as any).error || 'Failed to calculate custom plan pricing';
      res.status(response.status || 500).json({
        response: false,
        error: 'Failed to calculate custom plan pricing',
        message: errorMessage
      });
    }
  } catch (error) {
    console.error('[Calculate Custom Plan] Error:', error);
    res.status(500).json({
      response: false,
      error: 'Failed to calculate custom plan pricing',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleCreateCustomizedPlan: RequestHandler = async (req, res) => {
  try {
    const { plan_name, application_type, generic_module_id, duration, max_users } = req.body;

    // console.log('[Create Customized Plan] Received request:', {
    //   plan_name,
    //   application_type,
    //   generic_module_id,
    //   duration,
    //   max_users
    // });

    // Validate required fields
    if (!plan_name || !application_type || !generic_module_id || !Array.isArray(generic_module_id) || !duration || !max_users) {
      return res.status(400).json({
        response: false,
        error: 'Missing required fields',
        message: 'plan_name, application_type, generic_module_id, duration, and max_users are required'
      });
    }

    const requestBody = {
      plan_name,
      application_type,
      generic_module_id,
      duration,
      max_users
    };



    const response = await fetch('https://salesforce.msell.in/public/api/create-customized-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });



    const data = await response.json();

    // Forward the response from external API
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Create Customized Plan] Error:', error);
    res.status(500).json({
      response: false,
      error: 'Failed to create customized plan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};