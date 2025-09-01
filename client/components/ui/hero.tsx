import { motion } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, Play, Globe, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Navigation Header */}
      <motion.header 
        className="relative z-50 w-full px-6 py-4 lg:px-8 lg:py-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manacle
            </span>
          </motion.div>
          
          <nav className="hidden lg:flex items-center space-x-8">
            {["Solutions", "Features", "Pricing", "About", "Contact"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors duration-200"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden sm:flex">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Hero Content */}
      <motion.main 
        className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 py-20 lg:px-8 lg:py-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.15, 0.3, 0.15],
              x: [0, -40, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.35, 0.2],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </div>
        {/* Hero Headline */}
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-center text-slate-900 max-w-6xl leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Empowering Businesses with{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Smarter Software Solutions
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          className="mt-6 text-xl sm:text-2xl text-slate-600 text-center max-w-4xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Your one-stop solution for CRM, ERP, HRMS, SFA, and more. 
          <span className="font-semibold text-slate-700"> Transform your business operations</span> with our comprehensive suite of enterprise software.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Play className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button variant="outline" size="lg" className="border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300">
              Explore Solutions
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-500"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Trusted by 10,000+ companies</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">99.9% uptime guarantee</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">24/7 expert support</span>
          </div>
        </motion.div>
      </motion.main>

      {/* Hero Visual / Illustration */}
      <motion.section 
        className="relative z-10 px-6 lg:px-8 pb-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20">
            {/* Dashboard Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Revenue Growth</h3>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-3xl font-bold">+24.5%</div>
                <div className="text-blue-100 text-sm">vs last month</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Active Users</h3>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-3xl font-bold">2,847</div>
                <div className="text-emerald-100 text-sm">+12% this week</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Conversion Rate</h3>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-3xl font-bold">8.9%</div>
                <div className="text-orange-100 text-sm">+2.1% improvement</div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Business Performance Overview</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
              
              {/* Simplified Chart Bars */}
              <div className="flex items-end justify-between h-32 space-x-2">
                {[60, 80, 45, 90, 75, 85, 70].map((height, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg flex-1"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Interactive Service Tiles */}
      <motion.section 
        className="relative z-10 px-6 lg:px-8 pb-32"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-3xl lg:text-4xl font-bold text-center text-slate-900 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Our Complete Solution Suite
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "CRM", description: "Customer Relationship Management", color: "from-blue-500 to-cyan-500" },
              { title: "ERP", description: "Enterprise Resource Planning", color: "from-purple-500 to-pink-500" },
              { title: "HRMS", description: "Human Resource Management", color: "from-emerald-500 to-teal-500" },
              { title: "SFA", description: "Sales Force Automation", color: "from-orange-500 to-red-500" },
              { title: "Analytics", description: "Business Intelligence", color: "from-indigo-500 to-blue-500" },
              { title: "Security", description: "Enterprise-grade Protection", color: "from-green-500 to-emerald-500" }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-100 hover:border-transparent overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02
                }}
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Service Icon */}
                <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-8 h-8 bg-white rounded-lg"></div>
                </div>
                
                {/* Service Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-800 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {service.description}
                  </p>
                  
                  {/* Hover Description Reveal */}
                  <div className="mt-4 text-sm text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Streamline operations, boost productivity, and drive growth with our enterprise-grade {service.title.toLowerCase()} solution.
                  </div>
                </div>
                
                {/* Arrow Indicator */}
                <motion.div
                  className="absolute bottom-6 right-6 text-slate-400 group-hover:text-blue-600 transition-colors duration-300"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
