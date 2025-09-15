import React, { useState, useRef } from "react";
import emailjs from 'emailjs-com';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  MessageCircle,
  Clock,
  Headphones,
  FileText,
  Globe,
  Zap,
  Facebook,
  Linkedin,
  Star,
  ChevronDown,
  Check,
  Calendar
} from "lucide-react";
import { Header } from "../components/ui/header";
import { ThemeProvider } from "../components/ui/theme-provider";
import Footer from "@/components/ui/footer";
import "../styles/custom-dropdown.css";

export function ContactUs() {
  // Shared ref for synchronizing animations (must be inside component)
  const contactGridRef = useRef(null);
  const isContactGridInView = useInView(contactGridRef, { once: true, amount: 0.3 });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    companyName: "",
    solutionType: "Web Design & Development",
    preferredDate: "",
    preferredTime: "",
    privacyPolicy: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // Solution type options
  const solutionOptions = [
    "Attendance & Leave Management",
    "CRM Software",
    "Order Management Solution",
    "HRMS",
    "Distributor Management Solution",
    "Purchase Order Management",
    "Other"
  ];

  // Time slots options (10 AM to 6 PM)
  const timeSlots = [
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM"
  ];

  // Testimonial carousel state
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const nextTestimonial = () => setTestimonialIndex((i) => (i + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  // Testimonials data
  const testimonials = [
    {
      name: "Rajeev Pandey EDP (IT)",
      company: "Baidyanath",
      photo: "/customers/rajeev-pandey.jpg",
      review: "mSELL truly knows what they are doing. They helped our biggest problem of expiry on Distributor end through Their DMS. Thank you mSELL.",
      rating: 5,
    },
    {
      name: "RD Mishra (CIO)",
      company: "Om Sweets & Snacks",
      photo: "/customers/rd-mishra.jpg",
      review: "From sweets outlets to FMCG products the leap was tough, thanks to mSELL and their SFA solution to bring out the full potential of our sales force.",
      rating: 5,
    },
    {
      name: "Piyush Pant",
      company: "Neha Herbal",
      photo: "/customers/piyush-pant.jpg",
      review: "I knew we had a salesforce efficiency problem and needed it to be resolved ASAP. Thanks to mSELL for the rescue. Keep going mSELL.",
      rating: 5,
    },
  ];

  // Auto-slide effect for testimonials
  React.useEffect(() => {
    const timer = setTimeout(() => {
      nextTestimonial();
    }, 5000);
    return () => clearTimeout(timer);
  }, [testimonialIndex]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // const [meetingFormData, setMeetingFormData] = useState({
  //   fullName: "",
  //   email: "",
  //   phone: "",
  //   company: "",
  //   meetingType: "",
  //   preferredDate: "",
  //   preferredTime: "",
  //   timezone: "",
  //   platform: "",
  //   agenda: "",
  // });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const [isMeetingSubmitting, setIsMeetingSubmitting] = useState(false);
  // const [isMeetingSubmitted, setIsMeetingSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSolutionSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, solutionType: value }));
    setIsDropdownOpen(false);
    // Clear error when user selects
    if (errors.solutionType) {
      setErrors((prev) => ({ ...prev, solutionType: "" }));
    }
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({ ...prev, preferredTime: time }));
    setIsTimeDropdownOpen(false);
    // Clear error when user selects
    if (errors.preferredTime) {
      setErrors((prev) => ({ ...prev, preferredTime: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.solutionType.trim()) {
      newErrors.solutionType = "Solution type is required";
    }

    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = "You must agree to the privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleMeetingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setMeetingFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare email content
    const templateParams = {
      to_email: 'kshitizkant290@gmail.com',
      from_name: formData.fullName,
      from_email: formData.email,
      email: formData.email,
      phone: formData.phone,
      company_name: formData.companyName,
      solution_type: formData.solutionType,
      preferred_date: formData.preferredDate,
      preferred_time: formData.preferredTime,
      message: formData.message,
      subject: 'New Lead from the Site',
      formatted_message: `New lead from the site:\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nCompany Name: ${formData.companyName}\nQuery Solution: ${formData.solutionType}${formData.preferredDate ? `\nPreferred Date: ${formData.preferredDate}` : ''}${formData.preferredTime ? `\nPreferred Time: ${formData.preferredTime}` : ''}\nMessage: ${formData.message}`
    };

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // console.log(serviceId, templateId, userId);

      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      setIsSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        message: "",
        companyName: "",
        solutionType: "",
        preferredDate: "",
        preferredTime: "",
        privacyPolicy: false,
      });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      alert('Failed to send email. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleMeetingSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsMeetingSubmitting(true);

  //   // Simulate meeting form submission
  //   setTimeout(() => {
  //     setIsMeetingSubmitting(false);
  //     setIsMeetingSubmitted(true);

  //     // Reset form after submission
  //     setMeetingFormData({
  //       fullName: "",
  //       email: "",
  //       phone: "",
  //       company: "",
  //       meetingType: "",
  //       preferredDate: "",
  //       preferredTime: "",
  //       timezone: "",
  //       platform: "",
  //       agenda: "",
  //     });

  //     // Close modal and reset success message after a few seconds
  //     setTimeout(() => {
  //       setIsMeetingSubmitted(false);
  //       setIsMeetingModalOpen(false);
  //     }, 3000);
  //   }, 1500);
  // };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="manacle_theme">
      <style>{`
        html, body, #root { overflow-x: hidden !important; }
        body { position: relative; }
      * { box-sizing: border-box; }
      /* Removed the overly broad max-width rule that forced all descendants to full width
        (was collapsing the header dropdown & stretching desktop layout). */
  /* Allow images to scale responsively, but exclude header logo */
  .contact-us-page-wrapper main img { max-width: 100%; height: auto; }
  /* Ensure embedded iframes (Google Maps) fill their container height */
  .contact-us-page-wrapper iframe { width: 100%; height: 100%; display: block; }
      `}</style>
      <div className="contact-us-page-wrapper min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden w-full">
        <Header />
        <main className="w-full overflow-x-hidden">
          {/* Hero / Breadcrumb Section - adjusted to prevent horizontal overflow on mobile */}
          <section className="relative w-full min-h-[160px] flex items-center justify-center overflow-hidden pt-32 bg-transparent ">
            {/* Animated floating shapes for light/dark theme */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-br from-primary/40 to-accent/30 rounded-full blur-3xl animate-float-slow z-0 mix-blend-lighten dark:mix-blend-normal" style={{ animationDelay: '0s' }} />
            <div className="absolute right-20 top-10 w-20 h-20 bg-gradient-to-tr from-pink-400/40 to-purple-400/30 rounded-full blur-2xl animate-float-fast z-0 mix-blend-lighten dark:mix-blend-normal" style={{ animationDelay: '1.5s' }} />
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-80 h-16 bg-primary/20 rounded-full blur-2xl animate-float-medium z-0 mix-blend-lighten dark:mix-blend-normal" style={{ animationDelay: '2s' }} />
            <div className="absolute right-32 bottom-0 w-16 h-16 bg-gradient-to-t from-yellow-400/40 to-orange-400/30 rounded-full blur-xl animate-float-fast z-0 mix-blend-lighten dark:mix-blend-normal" style={{ animationDelay: '2.5s' }} />

            {/* Breadcrumb */}
            <nav className="relative z-10 w-full max-w-7xl px-2 sm:px-10 flex items-center justify-center">
              <div className="w-full">
                <div className="rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-2xl shadow-2xl border border-glass-border px-10 py-7 flex flex-wrap items-center justify-center gap-4 transition-colors duration-300">
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <svg className="w-8 h-8 text-primary mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
                    <span className="hidden sm:inline text-foreground/70 transition-colors duration-200">Home</span>
                    <span className="inline sm:hidden">/</span>
                  </div>
                  <span className="mx-2 text-foreground/40 text-2xl font-light">/</span>
                  <span className="text-primary font-bold text-xl tracking-wide transition-colors duration-200">Contact Us</span>
                </div>
              </div>
            </nav>
          </section>


          <div className="min-h-screen py-16 w-full overflow-x-hidden">
            <div className="container mx-auto px-4 max-w-full">
              {/* Header with Framer Motion Animation */}
              <motion.div
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="text-center mb-20"
              >
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-5xl md:text-6xl font-bold mb-8"
                >
                  Ready to start with our{' '}
                  <span
                    style={{ background: 'linear-gradient(90deg, #FF9800 40%, #B721FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    Solutions?
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-2xl text-foreground max-w-4xl mx-auto leading-relaxed"
                >
                  Get in touch with us and let's create something amazing together.
                </motion.p>
              </motion.div>

              {/* Main Contact Grid */}
              <div ref={contactGridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

                {/* Contact Form - Shows first on mobile, second on desktop */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={isContactGridInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:col-span-2 order-1 lg:order-2"
                >
                  <div className="contact-card-sticky p-12 rounded-3xl bg-card/90 backdrop-blur-sm border border-glass-border">
                    <h2 className="text-4xl font-extrabold mb-10 gradient-text">Send us a Message</h2>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 text-lg bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.fullName
                              ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                              : 'border-glass-border focus:ring-primary'
                              }`}
                            placeholder="Your Name"
                          />
                          {errors.fullName && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.fullName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 text-lg bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
                              ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                              : 'border-glass-border focus:ring-primary'
                              }`}
                            placeholder="your@email.com"
                          />
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Company Name (optional)
                          </label>
                          <Input
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 text-lg bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.companyName
                              ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                              : 'border-glass-border focus:ring-primary'
                              }`}
                            placeholder="Your Company Name"
                          />
                          {errors.companyName && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.companyName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Phone Number
                          </label>
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full px-6 py-4 text-lg bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${errors.phone
                              ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                              : 'border-glass-border focus:ring-primary'
                              }`}
                            placeholder="+1 (555) 123-4567"
                          />
                          {errors.phone && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Solution Type <span className="text-red-500">*</span>
                          </label>
                          <div className="custom-dropdown" ref={dropdownRef}>
                            <div
                              className={`w-full px-6 h-[56px] text-lg leading-[1.75rem] bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer flex items-center justify-between dropdown-trigger ${errors.solutionType
                                ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                                : 'border-glass-border focus:ring-primary'
                                }`}
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setIsDropdownOpen(!isDropdownOpen);
                                }
                              }}
                            >
                              <span className={formData.solutionType ? '' : 'custom-dropdown-placeholder'}>
                                {formData.solutionType || 'Select a solution type'}
                              </span>
                              <ChevronDown className={`w-5 h-5 text-foreground/60 custom-dropdown-chevron ${isDropdownOpen ? 'open' : ''}`} />
                            </div>

                            {isDropdownOpen && (
                              <div className="custom-dropdown-content">
                                {solutionOptions.map((option) => (
                                  <div
                                    key={option}
                                    className={`custom-dropdown-option ${formData.solutionType === option ? 'selected' : ''}`}
                                    onClick={() => handleSolutionSelect(option)}
                                  >
                                    <span>{option}</span>
                                    {formData.solutionType === option && (
                                      <Check className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {errors.solutionType && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.solutionType}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Preferred Meeting Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Preferred Meeting Date
                          </label>
                          <div className="relative">
                            <Input
                              name="preferredDate"
                              type="date"
                              value={formData.preferredDate}
                              onChange={handleChange}
                              min={new Date().toISOString().split('T')[0]}
                              className={`w-full px-6 py-4 pr-12 text-lg bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full ${errors.preferredDate
                                ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                                : 'border-glass-border focus:ring-primary'
                                }`}
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/60 pointer-events-none" />
                          </div>
                          {errors.preferredDate && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.preferredDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold mb-3">
                            Preferred Meeting Time
                          </label>
                          <div className="custom-dropdown" ref={timeDropdownRef}>
                            <div
                              className={`w-full px-6 h-[56px] text-lg leading-[1.75rem] bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer flex items-center justify-between dropdown-trigger ${errors.preferredTime
                                ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                                : 'border-glass-border focus:ring-primary'
                                }`}
                              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setIsTimeDropdownOpen(!isTimeDropdownOpen);
                                }
                              }}
                            >
                              <span className={formData.preferredTime ? '' : 'custom-dropdown-placeholder'}>
                                {formData.preferredTime || 'Select preferred time'}
                              </span>
                              <Clock className={`w-5 h-5 text-foreground/60 custom-dropdown-chevron ${isTimeDropdownOpen ? 'open' : ''}`} />
                            </div>

                            {isTimeDropdownOpen && (
                              <div className="custom-dropdown-content max-h-60 overflow-y-auto">
                                {timeSlots.map((time) => (
                                  <div
                                    key={time}
                                    className={`custom-dropdown-option ${formData.preferredTime === time ? 'selected' : ''}`}
                                    onClick={() => handleTimeSelect(time)}
                                  >
                                    <span>{time}</span>
                                    {formData.preferredTime === time && (
                                      <Check className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {errors.preferredTime && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.preferredTime}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-lg font-bold mb-3">
                          Additional Message <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className={`w-full px-6 py-4 text-lg bg-secondary/50 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300 ${errors.message
                            ? 'border-red-500 focus:ring-red-500 bg-red-50/10'
                            : 'border-glass-border focus:ring-primary'
                            }`}
                          placeholder="Tell us about your project requirements, timeline, and budget..."
                        />
                        {errors.message && (
                          <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Privacy Policy Checkbox */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="privacyPolicy"
                          name="privacyPolicy"
                          checked={formData.privacyPolicy}
                          onChange={handleChange}
                          className={`mt-1 w-5 h-5 rounded border-2 transition-all duration-300 ${errors.privacyPolicy
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-glass-border focus:ring-primary'
                            }`}
                        />
                        <div className="flex-1">
                          <label htmlFor="privacyPolicy" className="text-base text-foreground cursor-pointer">
                            I agree to Manacle Technologies{' '}
                            <a
                              href="/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-accent underline font-semibold"
                            >
                              Privacy Policy
                            </a>
                          </label>
                          {errors.privacyPolicy && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</span>
                              {errors.privacyPolicy}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 text-xl font-bold bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-300 neon-glow transform hover:scale-[1.02] hover:shadow-lg"
                      >
                        {isSubmitting ? "Sending..." : isSubmitted ? "Sent Successfully!" : "Get A Quote"}
                        <ArrowRight className="ml-3 w-6 h-6" />
                      </Button>

                      {isSubmitted && (
                        <div className="text-center text-emerald-500 font-medium mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          Thank you! Your request has been submitted. We'll be in touch within 24 hours.
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>

                {/* Left Side - Testimonials and Google Ratings - Shows second on mobile, first on desktop */}
                <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">

                  {/* Customer Testimonials */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isContactGridInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-gradient-to-br from-slate-50 to-white dark:from-[#1a1a1a] dark:to-[#0f0f0f] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg h-[380px] flex flex-col overflow-hidden"
                  >
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-4 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-center">
                        <h3 className="text-lg font-black bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent leading-tight">Join The Manacle Family</h3>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 p-4 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={testimonialIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.4 }}
                          className="h-full flex flex-col justify-center"
                        >
                          {/* Message Bubble */}
                          <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-md p-4 shadow-sm border border-slate-200 dark:border-slate-600 mb-3 relative">
                            {/* Message tail */}
                            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-600 transform rotate-45"></div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-2">
                              {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>

                            {/* Message */}
                            <p className="text-sm text-foreground/85 leading-relaxed">
                              "{testimonials[testimonialIndex].review}"
                            </p>
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3 px-1">
                            <img
                              src={testimonials[testimonialIndex].photo}
                              alt={testimonials[testimonialIndex].name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                              loading="lazy"
                            />
                            <div>
                              <div className="text-sm font-semibold text-foreground">
                                {testimonials[testimonialIndex].name}
                              </div>
                              <div className="text-xs text-foreground/60">
                                {testimonials[testimonialIndex].company}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Google Ratings */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isContactGridInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="contact-card-sticky p-8 rounded-2xl bg-card/90 backdrop-blur-sm border border-glass-border h-[400px] flex flex-col"
                  >
                    <div className="text-center flex flex-col h-full justify-center items-center">
                      {/* Google Logo */}
                      <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto" viewBox="0 0 48 48">
                          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                      </div>

                      {/* Rating Display */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <span className="text-4xl font-black text-primary">4.5</span>
                          <div className="flex">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                            ))}
                            <Star className="w-7 h-7 text-yellow-400 fill-yellow-400 opacity-50" />
                          </div>
                        </div>
                        <h3 className="text-xl font-extrabold mb-2">Google Reviews</h3>
                        <p className="text-base text-foreground/70 font-medium">Trusted by our customers</p>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-6">
                        <a
                          href="https://share.google/yfQqQIUQfwJnAGgol"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-300 text-base font-semibold hover:scale-105 border border-primary/20 hover:border-primary/30"
                        >
                          View Reviews on Google
                          <ArrowRight className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </div>


              </div>

              {/* Get In Touch & Office Hours Section */}
              <motion.div
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="mb-16"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Methods */}
                  <div className="contact-card-sticky p-8 rounded-2xl bg-card/90 backdrop-blur-sm border border-glass-border">
                    <h2 className="text-2xl font-extrabold mb-8 gradient-text">Get In Touch</h2>
                    <div className="space-y-4 mb-6">
                      <a href="mailto:sales@manacleindia.com" className="contact-item-sticky flex items-center space-x-4 p-3 rounded-lg hover:bg-primary/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg">Email Us</h3>
                          <p className="text-foreground text-base font-medium">sales@manacleindia.com</p>
                        </div>
                      </a>

                      <a href="tel:+919873250200" className="contact-item-sticky flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-accent to-neon-purple rounded-full flex items-center justify-center">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg">Call Us</h3>
                          <p className="text-foreground text-base font-medium">+91 9873250200</p>
                        </div>
                      </a>

                      <a href="https://wa.me/919873250200" target="_blank" rel="noopener noreferrer" className="contact-item-sticky flex items-center space-x-4 p-3 rounded-lg hover:bg-green-500/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-lg">WhatsApp</h3>
                          <p className="text-foreground text-base font-medium">Quick chat support</p>
                        </div>
                      </a>
                    </div>

                    {/* Average Response Time */}

                  </div>

                  {/* Office Hours */}
                  <div className="contact-card-sticky p-8 rounded-2xl bg-card/90 backdrop-blur-sm border border-glass-border">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-pink rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-extrabold">Office Hours</h2>
                    </div>
                    <div className="space-y-4 text-base">
                      <div className="flex justify-between">
                        <span className="text-foreground font-bold">Monday - Friday</span>
                        <span className="font-bold text-primary">9:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground font-bold">Saturday</span>
                        <span className="font-bold text-primary">10:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground font-bold">Sunday</span>
                        <span className="font-bold text-accent">Closed</span>
                      </div>

                      <div className="border-t border-glass-border pt-4 mt-6">
                        <div className="text-center text-sm text-foreground/70">
                          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                            <div className="text-center">
                              <p className="text-sm font-bold text-foreground mb-1">
                                Average Response Time
                              </p>
                              <p className="text-2xl font-black text-primary">
                                1-2 Hours
                              </p>
                              <p className="text-xs text-foreground/70 mt-1">
                                During business hours
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Location & Map Section with Framer Motion */}
              <motion.div
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="mb-16"
              >
                <div className="contact-card-sticky p-8 rounded-2xl bg-card/90 backdrop-blur-sm border border-glass-border">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-neon-blue to-neon-pink rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold gradient-text">Our Location</h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-extrabold text-xl mb-4">Main Office</h3>
                          <p className="text-foreground text-lg leading-relaxed font-medium">
                            E-71, 4th floor, Sector-6, Noida<br />
                            Uttar-Pradesh 201301<br />
                            <span className="text-primary font-bold">Serving clients worldwide</span>
                          </p>
                        </div>

                        <div className="border-t border-glass-border pt-6">
                          <h4 className="font-bold text-lg mb-4">Service Areas</h4>
                          <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold">Global Remote</span>
                            <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold">India</span>
                            <span className="px-4 py-2 bg-neon-blue/10 text-neon-blue rounded-full text-sm font-bold">USA/Canada</span>
                            <span className="px-4 py-2 bg-neon-purple/10 text-neon-purple rounded-full text-sm font-bold">Europe</span>
                          </div>
                        </div>

                        {/* <div className="mt-8">
                          <Button
                            onClick={() => setIsMeetingModalOpen(true)}
                            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue transition-all duration-300"
                          >
                            Schedule a Virtual Meeting
                            <ArrowRight className="ml-3 w-5 h-5" />
                          </Button>
                        </div> */}
                      </div>
                    </div>

                    <div>
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-glass-border overflow-hidden">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224203.07933862173!2d77.01536178588864!3d28.59458299677065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5d5cd8c0c95%3A0x4717ef18de1436b5!2sManacle%20Technologies%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1754559661411!5m2!1sen!2sin"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={true}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Manacle Location - Maharani Colony, Patna"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Media & Connect */}
              <div className="text-center">
                <h3 className="text-3xl font-extrabold mb-8 gradient-text">Connect With Us</h3>
                <div className="flex flex-wrap justify-center gap-6 mb-8 max-w-xs mx-auto">
                  <a
                    href="https://www.facebook.com/techmanacle/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-sticky p-4 rounded-full bg-card border border-glass-border hover:bg-gradient-to-r hover:from-[#1877F3] hover:to-[#1877F3] hover:border-[#1877F3]/50 transition-all duration-300 group"
                  >
                    <Facebook className="w-6 h-6 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://x.com/ManacleTech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-sticky p-4 rounded-full bg-card border border-glass-border hover:bg-gradient-to-r hover:from-[#000000] hover:to-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-all duration-300 group"
                  >
                    <img src="/x.svg" alt="X" className="w-5 h-5 filter brightness-75 group-hover:brightness-0 group-hover:invert transition-all duration-300" />
                  </a>
                  <a
                    href="https://www.instagram.com/techmanacle/"
                    target="_blank"
                    className="social-link-sticky p-4 rounded-full bg-card border border-glass-border hover:bg-gradient-to-r hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#515BD4] hover:border-[#DD2A7B]/50 transition-all duration-300 group"
                  >
                    <Instagram className="w-6 h-6 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/manacletechnologies/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-sticky p-4 rounded-full bg-card border border-glass-border hover:bg-gradient-to-r hover:from-[#0A66C2] hover:to-[#0A66C2] hover:border-[#0A66C2]/50 transition-all duration-300 group"
                  >
                    <Linkedin className="w-6 h-6 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="https://youtube.com/@techmanacle?si=lKZw7FngfmlXE49z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link-sticky p-4 rounded-full bg-card border border-glass-border hover:bg-gradient-to-r hover:from-[#FF0000] hover:to-[#FF0000] hover:border-[#FF0000]/50 transition-all duration-300 group"
                  >
                    <Youtube className="w-6 h-6 group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>

                <p className="text-lg text-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                  Follow Manacle for the latest updates, company news, and to connect with our team. We're here to help you grow and succeed. Reach out anytime!
                </p>
              </div>
            </div>

            {/* Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10"></div>
          </div>
        </main>

        {/* Virtual Meeting Modal */}
        {/* {isMeetingModalOpen && (
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="contact-card-sticky max-w-2xl w-full max-h-[90vh] p-8 rounded-3xl bg-card/95 backdrop-blur-sm border border-glass-border">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-extrabold gradient-text">Schedule Virtual Meeting</h2>
                <button
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors duration-300"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleMeetingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Full Name *
                    </label>
                    <Input
                      name="fullName"
                      value={meetingFormData.fullName}
                      onChange={handleMeetingChange}
                      required
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Email Address *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={meetingFormData.email}
                      onChange={handleMeetingChange}
                      required
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      value={meetingFormData.phone}
                      onChange={handleMeetingChange}
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Company/Organization
                    </label>
                    <Input
                      name="company"
                      value={meetingFormData.company}
                      onChange={handleMeetingChange}
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold mb-3">
                    Meeting Type *
                  </label>
                  <select
                    name="meetingType"
                    value={meetingFormData.meetingType}
                    onChange={handleMeetingChange}
                    required
                    className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  >
                    <option value="">Select Meeting Type</option>
                    <option value="consultation">Project Consultation</option>
                    <option value="demo">Product Demo</option>
                    <option value="proposal">Project Proposal Discussion</option>
                    <option value="support">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Preferred Date *
                    </label>
                    <Input
                      name="preferredDate"
                      type="date"
                      value={meetingFormData.preferredDate}
                      onChange={handleMeetingChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Preferred Time *
                    </label>
                    <Input
                      name="preferredTime"
                      type="time"
                      value={meetingFormData.preferredTime}
                      onChange={handleMeetingChange}
                      required
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold mb-3">
                      Timezone *
                    </label>
                    <select
                      name="timezone"
                      value={meetingFormData.timezone}
                      onChange={handleMeetingChange}
                      required
                      className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                    >
                      <option value="">Select Timezone</option>
                      <option value="IST">IST (India Standard Time)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="PST">PST (Pacific Standard Time)</option>
                      <option value="GMT">GMT (Greenwich Mean Time)</option>
                      <option value="CET">CET (Central European Time)</option>
                      <option value="JST">JST (Japan Standard Time)</option>
                      <option value="AEST">AEST (Australian Eastern Time)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-base font-bold mb-3">
                    Preferred Platform *
                  </label>
                  <select
                    name="platform"
                    value={meetingFormData.platform}
                    onChange={handleMeetingChange}
                    required
                    className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                  >
                    <option value="">Select Platform</option>
                    <option value="zoom">Zoom</option>
                    <option value="google-meet">Google Meet</option>
                    <option value="microsoft-teams">Microsoft Teams</option>
                    <option value="whatsapp">WhatsApp Video Call</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold mb-3">
                    Meeting Agenda / What would you like to discuss?
                  </label>
                  <Textarea
                    name="agenda"
                    value={meetingFormData.agenda}
                    onChange={handleMeetingChange}
                    rows={4}
                    className="w-full px-4 py-3 text-base bg-secondary/50 border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all duration-300"
                    placeholder="Please describe what you'd like to discuss during the meeting..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setIsMeetingModalOpen(false)}
                    className="flex-1 py-3 text-base font-bold bg-secondary hover:bg-secondary/80 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isMeetingSubmitting}
                    className="flex-1 py-3 text-base font-bold bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-blue transition-all duration-300"
                  >
                    {isMeetingSubmitting ? "Scheduling..." : isMeetingSubmitted ? "Meeting Scheduled!" : "Schedule Meeting"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>

                {isMeetingSubmitted && (
                  <div className="text-center text-emerald-500 font-medium mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    🎉 Thank you! Your meeting has been scheduled. We'll send you a confirmation email with the meeting details within 24 hours.
                  </div>
                )}
              </form>
            </div>
          </div>
        )} */}

        {/* Footer */}
        <Footer />


      </div>
    </ThemeProvider>
  );
}

export default ContactUs; 