import { useState, useEffect, useRef } from "react";
// Auth0 removed
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { MobileNav } from "./mobile-nav";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";
import { apiFetch } from '../../lib/apiFetch';
import { prefetchRoute } from '../../lib/prefetchRoutes';
import { useTheme } from "./theme-provider";

// Header component
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const lastPathRef = useRef(location.pathname + location.search + location.hash);
  // Simple session detection (cookie/localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [clickedDropdown, setClickedDropdown] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  // Force mobile (hamburger) view when horizontal space is tight or in portrait orientation at certain widths
  const [forceMobileNav, setForceMobileNav] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-close mobile menu when route actually changes
  useEffect(() => {
    const current = location.pathname + location.search + location.hash;
    if (current !== lastPathRef.current) {
      lastPathRef.current = current;
      setIsMenuOpen(false);
      setClickedDropdown(null);
    }
  }, [location]);

  useEffect(() => {
    // Check for session flag in localStorage
    setIsAuthenticated(!!localStorage.getItem('manacle_session'));
  }, []);

  // Auto-hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide header if user has scrolled down more than 50px
      if (currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else {
        // Hide header when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Determine when to force the hamburger menu regardless of Tailwind breakpoints
  useEffect(() => {
    const evaluateLayout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = h > w; // orientation check
      /* Heuristics:
         - Always mobile below 1024px (covers existing lg breakpoint logic)
         - In portrait, give more room: force mobile if width < 1280 (prevents cramped nav)
         - Also force mobile if available width is wide but still under a threshold where items start wrapping (~1150)
      */
      const shouldForce = w < 1024 || (isPortrait && w < 1280) || (w >= 1024 && w < 1150);
      setForceMobileNav(shouldForce);
    };
    evaluateLayout();
    window.addEventListener('resize', evaluateLayout, { passive: true });
    window.addEventListener('orientationchange', evaluateLayout);
    return () => {
      window.removeEventListener('resize', evaluateLayout);
      window.removeEventListener('orientationchange', evaluateLayout);
    };
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clickedDropdown &&
        !Object.values(dropdownRefs.current).some(ref =>
          ref && ref.contains(event.target as Node)
        )) {
        setClickedDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickedDropdown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Toggle dropdown on click
  const handleDropdownClick = (itemName: string) => {
    if (clickedDropdown === itemName) {
      setClickedDropdown(null);
    } else {
      setClickedDropdown(itemName);
    }
  };

  // Determine if dropdown should be shown (either by hover or click)
  const isDropdownVisible = (itemName: string) => {
    return activeDropdown === itemName || clickedDropdown === itemName;
  };

  // Improved hover handlers with better timing
  const handleMouseEnter = (itemName: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!clickedDropdown) {
      setActiveDropdown(itemName);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (!clickedDropdown) {
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 300); // Increased delay to 300ms for better UX
    }
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    if (!clickedDropdown) {
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 150); // Shorter delay when leaving dropdown
    }
  };

  // Define types for nav items and dropdown items
  type DropdownItem = {
    name: string;
    href: string;
    description?: string;
  };

  type DropdownCategory = {
    title: string;
    href?: string; // Make category titles clickable
    items: DropdownItem[];
  };

  type NavItem = {
    name: string;
    href: string;
    highlight?: boolean;
    hasDropdown?: boolean;
    dropdownContent?: {
      categories: DropdownCategory[];
    };
  };

  const navItems: NavItem[] = [
    { name: "Home", href: "/" },
    // { name: "Website Builder", href: "/auto-site", highlight: true },
    {
      name: "Our Solutions",
      href: "#",
      hasDropdown: true,
      dropdownContent: {
        categories: [
          {
            title: "SFA Solutions",
            href: "/sales-force-automation", // Add href to make title clickable
            items: [

              { name: "Attendance & Leave Management", href: "/attendance-leave-management" },
              { name: "Order Management Solution", href: "/order-management-solution" },
              { name: "Field Force Tracking & Activity", href: "/field-force-tracking" },
              { name: "Distributor Management Solution", href: "/distributor-management-solution" },
              { name: "Merchandising & Retail Execution", href: "/merchandising-retail-execution" },
              { name: "Expenses & Claims Management", href: "/expenses-claims-management" },
              { name: "Retailer Management Solution", href: "/retailer-management-solution" },
              { name: "Sales Activity Management", href: "/sales-activity-management" },
            ],
          },
          {
            title: "ERP Solutions",
            items: [
              { name: "Purchase Order Management", href: "/purchase-order-management" },
              { name: "Store Management Software", href: "/store-management-software" },
              { name: "Production Management", href: "/production-management" },
              { name: "Packing Management", href: "/packing-management" },
              { name: "Demand Generation", href: "/demand-generation" },
              { name: "Invoice Generation Solution", href: "/invoice-generation-solution" },
              { name: "Dispatch Management", href: "/dispatch-management" },
              { name: "Plant Management", href: "/plant-management" },
            ],
          },
          {
            title: "Others Solution",
            items: [
              { name: "Human Resource Management (HRMS)", href: "/hrms" },
              { name: "Website Development Services", href: "/website-development-services" },
              { name: "CRM Software", href: "/crm-software" },
              { name: "Digital Marketing Services", href: "/digital-marketing-services" },
              { name: "WhatsApp Ordering System", href: "/whatsapp-ordering-system" }
            ],
          },
        ],
      },
    },
    {
      name: "Resources",
      href: "#",
      hasDropdown: true,
      dropdownContent: {
        categories: [
          {
            title: "Our Resources",
            items: [
              { name: "Blogs", href: "/blogs" },
              { name: "Podcasts", href: "/podcasts" },
              { name: "Seminars & Webinars", href: "/seminars-webinars" },
              { name: "FAQs", href: "/faqs" },
            ]
          }
        ]
      }
    },
  /*
  {
    name: "Portfolio",
    href: "/gallery",
    hasDropdown: true,
    dropdownContent: {
      categories: [
        {
       },
   },
Gallery", description: "View all our projects", href: "/gallery" },
            { name: "Healthcare Projects", description: "Medical & pharmaceutical sites", href: "/gallery" },
            { name: "Educational Platforms", description: "Learning & training websites", href: "/gallery" },
          ],
        },
        {
          title: "By Industry",
          items: [
            { name: "E-commerce", description: "Online stores & shops", href: "/gallery" },
            { name: "Non-Profit Organizations", description: "NGO & community sites", href: "/gallery" },
            { name: "Business Services", description: "Professional service sites", href: "/gallery" },
          ],
        },
      ],
    },
  },
  */    { name: "About", href: "/about-us" },
    { name: "Contact", href: "/contact-us" },
  ];

  // Robust mobile navigation handler: closes menu, then navigates via SPA; falls back to hard reload if needed
  const handleMobileNavigate = (to: string) => {
    setIsMenuOpen(false);
    setClickedDropdown(null);
    // Defer to next tick so unmount animations/state updates don't cancel navigation on some mobile browsers
    requestAnimationFrame(() => {
      const before = window.location.pathname;
      navigate(to);
      // Fallback: if path didn't change shortly, force full navigation
      setTimeout(() => {
        if (window.location.pathname === before) {
          window.location.href = to;
        }
      }, 60);
    });
  };

  return (
    <>
      <style>{`
        /* Center navigation in larger portraits relative to screen, not container */
        @media (orientation: portrait) and (min-width: 1280px) {
          .nav-center-viewport {
            position: absolute !important;
            left: 50vw !important;
            transform: translateX(-50%) !important;
          }
        }
      `}</style>
      <header className={`fixed top-0 left-0 right-0 z-50 py-3 md:py-3 lg:py-4 xl:py-4 transition-transform duration-300 ease-in-out backdrop-blur-md ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4 md:px-5 lg:px-6 xl:px-4">
          <div className="flex items-center justify-between">
            {/* Logo & Company Name - Responsive sizing */}
            <div className="flex items-center">
              <a href="/" className="flex items-center group">
                {/* Conditional Theme-based Logo */}
                <img
                  src={theme === 'dark' ? "/manacle_logo_dark.png" : "/manacle_logo.png"}
                  alt="Manacle Logo"
                  className="h-16 sm:h-10 md:h-12 lg:h-14 xl:h-24 w-auto object-contain transition-all duration-300 hover:scale-105"
                />
              </a>
            </div>

            {/* Centered Navigation Menu - Responsive & Forced Collapse Logic */}
            {!forceMobileNav && (
              <div className="flex flex-1 justify-center nav-center-viewport">
                <nav className="inline-flex items-center bg-card/90 backdrop-blur-xl border border-glass-border rounded-full px-4 md:px-5 py-2 shadow-lg">
                  <div className="flex items-center space-x-4 md:space-x-5 lg:space-x-6">
                    {navItems.map((item) => (
                      <div
                        key={item.name}
                        className="relative"
                        ref={item.hasDropdown ? (node) => {
                          dropdownRefs.current[item.name] = node;
                        } : null}
                        onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.name)}
                        onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                      >
                        <div className="flex items-center">
                          <a
                            href={item.href}
                            onMouseEnter={() => prefetchRoute(item.href)}
                            className={`${item.highlight
                              ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-extrabold"
                              : "text-foreground hover:text-primary"
                              } transition-colors duration-300 relative group font-bold text-sm md:text-sm lg:text-base xl:text-base`}
                          >
                            {item.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full"></span>
                          </a>
                          {item.hasDropdown && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDropdownClick(item.name);
                              }}
                              className="ml-1 text-foreground hover:text-primary transition-colors duration-300"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${isDropdownVisible(item.name) ? "rotate-180" : ""
                                  }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Mega Menu Dropdown */}
                        {item.hasDropdown && isDropdownVisible(item.name) && (
                          <>
                            {/* Invisible bridge to prevent dropdown from closing */}
                            <div
                              className="absolute top-full left-1/2 transform -translate-x-1/2 w-[480px] md:w-[520px] lg:w-[580px] xl:w-[600px] h-3 z-40"
                              onMouseEnter={handleDropdownMouseEnter}
                              onMouseLeave={handleDropdownMouseLeave}
                            />
                            <div
                              className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 ${item.name === 'Resources' ? 'w-[260px]' : 'w-[95vw] sm:w-[600px] md:w-[700px] lg:w-[900px]'} max-w-[98vw] glass-effect border border-glass-border rounded-2xl p-4 md:p-5 shadow-2xl z-50 bg-card/95 backdrop-blur-xl max-h-[75vh] md:max-h-[420px] overflow-y-auto`}
                              onMouseEnter={handleDropdownMouseEnter}
                              onMouseLeave={handleDropdownMouseLeave}
                              style={{ scrollbarWidth: 'thin' }}
                            >
                              <div className={`grid ${item.name === 'Resources'
                                ? 'grid-cols-1 '
                                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                                {item.dropdownContent?.categories.map((category, index) => (
                                  <div key={index} className={`space-y-3 ${item.name === 'Resources' ? 'w-full' : ''}`}>
                                    {category.href ? (
                                      <Link
                                        to={category.href}
                                        className="block group/category"
                                        onMouseEnter={() => prefetchRoute(category.href)}
                                        onClick={() => {
                                          setClickedDropdown(null);
                                          setActiveDropdown(null);
                                        }}
                                      >
                                        <h3 className={`font-bold text-base md:text-lg gradient-text mb-2 group-hover/category:text-primary transition-colors cursor-pointer ${item.name === 'Resources' ? '' : ''}`}>
                                          {category.title}
                                        </h3>
                                      </Link>
                                    ) : (
                                      <h3 className={`font-bold text-base md:text-lg gradient-text mb-2 ${item.name === 'Resources' ? '' : ''}`}>
                                        {category.title}
                                      </h3>
                                    )}
                                    <ul className={`space-y-2 ${item.name === 'Resources' ? 'w-full' : ''}`}>
                                      {category.items.map((subItem, subIndex) => (
                                        <li key={subIndex} className={item.name === 'Resources' ? 'w-full' : ''}>
                                          <Link
                                            to={subItem.href || `#${subItem.name.toLowerCase().replace(/\s+/g, "-")}`}
                                            className={`block group/item ${item.name === 'Resources' ? '' : ''}`}
                                            onMouseEnter={() => subItem.href && prefetchRoute(subItem.href)}
                                            onClick={() => {
                                              setClickedDropdown(null);
                                              setActiveDropdown(null);
                                            }}
                                          >
                                            <div className={`font-medium text-sm md:text-base text-foreground group-hover/item:text-primary transition-colors duration-200 ${item.name === 'Resources' ? '' : ''}`}>
                                              {subItem.name}
                                            </div>
                                            {subItem.description && (
                                              <div className={`text-xs md:text-sm text-foreground/80 group-hover/item:text-foreground transition-colors duration-200 ${item.name === 'Resources' ? '' : ''}`}>
                                                {subItem.description}
                                              </div>
                                            )}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                              {/* Featured Section (omit for Resources dropdown) */}
                              {item.name !== 'Resources' && (
                                <div className="mt-4 pt-4 border-t border-glass-border">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-bold text-foreground mb-1 text-sm md:text-base">
                                        Ready to start your project?
                                      </h4>
                                      <p className="text-xs md:text-sm text-foreground/70">
                                        Let's discuss your requirements and bring your vision
                                        to life.
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-300 text-xs md:text-sm"
                                      onClick={() => {
                                        setClickedDropdown(null);
                                        window.location.href = '/contact-us';
                                      }}
                                    >
                                      Get A Quote
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            )}

            {/* Right Side Elements - Get Quote & Theme Toggle */}
            <div className="hidden lg:flex items-center space-x-3">
               <ThemeToggle />
              {/*<Button
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-300 text-xs md:text-xs lg:text-sm xl:text-sm px-3 md:px-3 lg:px-4 xl:px-4 py-1.5 md:py-1.5 lg:py-2 xl:py-2"
                onClick={() => window.location.href = '/contact-us'}
              >
                Get A Quote
              </Button> */}

              {/* Auth Buttons - Commented Out */}
              <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-4">
                {isAuthenticated ? (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs md:text-xs lg:text-sm xl:text-sm px-3 md:px-3 lg:px-4 xl:px-4 py-1.5 md:py-1.5 lg:py-2 xl:py-2"
                    onClick={() => {
                      // Dispatch logout event BEFORE removing session data
                      window.dispatchEvent(new CustomEvent('user-logout'));

                      // Remove session flag and call logout API
                      localStorage.removeItem('manacle_session');
                      apiFetch('/api/logout').then(() => {
                        window.location.href = '/login';
                      });
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-accent text-xs md:text-xs lg:text-sm xl:text-sm px-3 md:px-3 lg:px-4 xl:px-4 py-1.5 md:py-1.5 lg:py-2 xl:py-2"
                      onClick={() => window.location.href = '/login'}
                    >
                      Login
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#8A2BE2] to-[#4169E1] text-white text-xs md:text-xs lg:text-sm xl:text-sm px-3 md:px-3 lg:px-4 xl:px-4 py-1.5 md:py-1.5 lg:py-2 xl:py-2"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button - Consistent with responsive design */}
            <button
              aria-label="Toggle navigation menu"
              className={`${forceMobileNav ? 'block' : 'lg:hidden'} text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <MobileNav
            navItems={navItems}
            isOpen={isMenuOpen}
            isHeaderVisible={isHeaderVisible}
            clickedDropdown={clickedDropdown}
            setClickedDropdown={setClickedDropdown}
            setIsMenuOpen={setIsMenuOpen}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </header>
    </>
  );
}
