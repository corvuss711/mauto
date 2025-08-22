import "./global.css";

import { Toaster } from "@/components/ui/toaster";
// Auth0 removed
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, lazy } from 'react';
// Route-level code splitting: each page lazily loaded so initial bundle shrinks.
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
// const Gallery = lazy(() => import('./pages/Gallery'));
const AutoSite = lazy(() => import('./pages/AutoSite'));
const Login = lazy(() => import('./pages/Login'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const Signup = lazy(() => import('./pages/Signup'));
const Blogs = lazy(() => import('./pages/Blogs'));
const CRMSoftwareFundamentals = lazy(() => import('./pages/blogs/CRMSoftwareFundamentals'));
const DispatchFundamentals = lazy(() => import('./pages/blogs/DispatchFundamentals'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const SeminarsWebinars = lazy(() => import('./pages/SeminarsWebinars'));
// Solutions pages
const Attendance_Leave_Management = lazy(() => import('./pages/solutions/Attendance_Leave_Management'));
const Order_Management_Solution = lazy(() => import('./pages/solutions/Order_Management_Solution'));
const Field_Force_Tracking = lazy(() => import('./pages/solutions/Field_Force_Tracking'));
const Distributor_Management_Solution = lazy(() => import('./pages/solutions/Distributor_Management_Solution'));
const Merchandising_Retail = lazy(() => import('./pages/solutions/Merchandising_Retail'));
const Expenses_Claims = lazy(() => import('./pages/solutions/Expenses_Claims'));
const Retailer_Management = lazy(() => import('./pages/solutions/Retailer_Management'));
const Sales_Activity = lazy(() => import('./pages/solutions/Sales_Activity'));
const Purchase_Order = lazy(() => import('./pages/solutions/Purchase_Order'));
const Store_Management = lazy(() => import('./pages/solutions/Store_Management'));
const Production_Management = lazy(() => import('./pages/solutions/Production_Management'));
const Packing_Management = lazy(() => import('./pages/solutions/Packing_Management'));
const Demand_Generation = lazy(() => import('./pages/solutions/Demand_Generation'));
const Invoice_Generation = lazy(() => import('./pages/solutions/Invoice_Generation'));
const Dispatch_Management = lazy(() => import('./pages/solutions/Dispatch_Management'));
const Plant_Management = lazy(() => import('./pages/solutions/Plant_Management'));
const HRMS = lazy(() => import('./pages/solutions/HRMS'));
const Website_Development = lazy(() => import('./pages/solutions/Website_Development'));
const CRM = lazy(() => import('./pages/solutions/CRM'));
const Digital_Marketing = lazy(() => import('./pages/solutions/Digital_Marketing'));
const Whatsapp_Ordering = lazy(() => import('./pages/solutions/Whatsapp_Ordering'));


const queryClient = new QueryClient();


const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', fontFamily: 'sans-serif', fontSize: 14, opacity: .7 }}>
    Loading...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            {/* <Route path="/services" element={<Services />} /> */}
            {/* <Route path="/gallery" element={<Gallery />} /> */}
            <Route path="/auto-site" element={
              <ProtectedRoute>
                <AutoSite />
              </ProtectedRoute>
            } />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/attendance-leave-management" element={<Attendance_Leave_Management />} />
            <Route path="/order-management-solution" element={<Order_Management_Solution />} />
            <Route path="/field-force-tracking" element={<Field_Force_Tracking />} />
            <Route path="/distributor-management-solution" element={<Distributor_Management_Solution />} />
            <Route path="/merchandising-retail-execution" element={<Merchandising_Retail />} />
            <Route path="/expenses-claims-management" element={<Expenses_Claims />} />
            <Route path="/retailer-management-solution" element={<Retailer_Management />} />
            <Route path="/sales-activity-management" element={<Sales_Activity />} />
            <Route path="/purchase-order-management" element={<Purchase_Order />} />
            <Route path="/store-management-software" element={<Store_Management />} />
            <Route path="/production-management" element={<Production_Management />} />
            <Route path="/packing-management" element={<Packing_Management />} />
            <Route path="/demand-generation" element={<Demand_Generation />} />
            <Route path="/invoice-generation-solution" element={<Invoice_Generation />} />
            <Route path="/dispatch-management" element={<Dispatch_Management />} />
            <Route path="/plant-management" element={<Plant_Management />} />
            <Route path="/hrms" element={<HRMS />} />
            <Route path="/website-development-services" element={<Website_Development />} />
            <Route path="/crm-software" element={<CRM />} />
            <Route path="/digital-marketing-services" element={<Digital_Marketing />} />
            <Route path="/whatsapp-ordering-system" element={<Whatsapp_Ordering />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/crm-software-fundamentals" element={<CRMSoftwareFundamentals />} />
            <Route path="/blogs/dispatch-automation-fundamentals" element={<DispatchFundamentals />} />
            <Route path="/podcasts" element={<Podcasts />} />
            <Route path="/seminars-webinars" element={<SeminarsWebinars />} />
            {/* Redirects */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
