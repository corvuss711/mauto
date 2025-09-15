import { motion } from "framer-motion";
import { CheckCircle, BarChart2, Cpu, Users, Smartphone, Smile, Repeat, TrendingUp } from "lucide-react";
import SeamlessIntegrations from "./seamless-integrations";

const features = [
  {
    icon: <Cpu className="text-orange-500 w-7 h-7" />,
    title: "Tools that fit your work",
    desc: "Software that matches your process, so teams spend less time on busywork and more on real results."
  },
  {
    icon: <BarChart2 className="text-blue-500 w-7 h-7" />,
    title: "Clear, simple insights",
    desc: "See what's working and what needs attention—without digging through heavy reports."
  },
  {
    icon: <Users className="text-green-500 w-7 h-7" />,
    title: "Keep customers close",
    desc: "Track conversations and follow‑ups in one place so nothing slips."
  },
  {
    icon: <Smile className="text-pink-500 w-7 h-7" />,
    title: "Built around people",
    desc: "Plain‑language screens, quick support, and tidy workflows help teams adopt fast."
  },
  {
    icon: <Repeat className="text-indigo-500 w-7 h-7" />,
    title: "We stay with you",
    desc: "From setup to everyday use, we help you get value and keep improving over time."
  },
  {
    icon: <TrendingUp className="text-yellow-500 w-7 h-7" />,
    title: "Room to grow",
    desc: "Add modules and users as you scale—without starting over."
  }
];

export default function HowHelpingCompanies() {
  return (
    <section className="relative py-16 sm:py-20 md:py-28 bg-gradient-to-br from-white via-orange-50 to-purple-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-gray-900 dark:to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col lg:flex-row items-center gap-12 sm:gap-16 lg:gap-12">
        {/* Left: Features */}
        <div className="flex-1 w-full space-y-8">
          <motion.h2
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent leading-tight pb-2 drop-shadow-md"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.25, 0.25, 1.25],
              type: "spring",
              stiffness: 100
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            How we help companies
            <motion.span
              className="block mt-2 text-gray-700 dark:text-orange-200 font-normal text-lg sm:text-xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.7,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
            >
              hit their goals, step by step
            </motion.span>
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-foreground/70 dark:text-gray-300 mb-6 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.7,
              ease: "easeOut"
            }}
            viewport={{ once: true }}
          >
            We help sales and distribution teams work faster and with more clarity. Here's where we make a difference:
          </motion.p>
          <ul className="space-y-6">
            {features.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: -60, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: 0.1 + i * 0.15,
                  duration: 0.8,
                  ease: [0.25, 0.25, 0.25, 1.25],
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 backdrop-blur-sm transition-colors duration-200 cursor-pointer"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 + i * 0.1,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 150,
                    damping: 15
                  }}
                  viewport={{ once: true }}
                  className="text-blue-500"
                >
                  {f.icon}
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.15,
                    duration: 0.7,
                    ease: [0.25, 0.25, 0.25, 1]
                  }}
                  viewport={{ once: true }}
                >
                  <motion.h3
                    className="text-lg sm:text-xl font-semibold text-foreground dark:text-orange-200 mb-1 flex items-center gap-2 drop-shadow"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + i * 0.15,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true }}
                  >
                    {f.title}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.6 + i * 0.15,
                        duration: 0.4,
                        ease: "backOut"
                      }}
                      viewport={{ once: true }}
                      whileHover={{
                        scale: 1.2,
                        rotate: 360,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                    >
                      <CheckCircle className="w-5 h-5 text-orange-400 ml-1" />
                    </motion.div>
                  </motion.h3>
                  <motion.div
                    className="text-foreground/70 dark:text-gray-400 text-sm sm:text-base"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5 + i * 0.15,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    viewport={{ once: true }}
                  >
                    {f.desc}
                  </motion.div>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </div>
        {/* Right: Animated Illustration */}
        {/* <motion.div
          className="flex-1 flex justify-center items-center w-full max-w-md"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
        >
          <motion.div
            animate={{ y: [0, -16, 0, 16, 0], rotate: [0, 2, 0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
            className="relative w-64 h-96 bg-gradient-to-br from-orange-100 to-purple-100 dark:from-slate-900 dark:to-gray-900 rounded-3xl shadow-2xl border-4 border-orange-200 dark:border-orange-700 flex items-center justify-center overflow-hidden"
          >
            
            <div className="absolute inset-0 flex flex-col items-stretch justify-start p-4 gap-2">
             
              <div className="w-28 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mb-1 animate-pulse self-center" />
              
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-300 to-yellow-300 dark:from-orange-600 dark:to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow">U</div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">User Name</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-green-400/80 animate-pulse" />
                  <div className="w-4 h-4 rounded-full bg-blue-400/80" />
                </div>
              </div>
             
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative rounded-xl bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-600 dark:to-orange-800 flex items-center px-3 py-2 mb-1 overflow-hidden">
                <span className="text-xs font-semibold text-gray-800 dark:text-white mr-2">Insight Highlights</span>
                <span className="ml-auto text-xs bg-yellow-400/80 dark:bg-yellow-700 text-white px-2 py-1 rounded shadow">Try Now</span>
              </motion.div>
             
              <div className="flex justify-between gap-2 mb-1">
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2, repeatType: 'mirror' }} className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-center">
                  <div className="text-[11px] text-gray-600 dark:text-gray-300">Today's Sales</div>
                  <div className="text-sm font-bold text-orange-600 dark:text-orange-300">₹ 5790</div>
                </motion.div>
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.2, repeatType: 'mirror', delay: 0.1 }} className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-center">
                  <div className="text-[11px] text-gray-600 dark:text-gray-300">New Leads</div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-300">12</div>
                </motion.div>
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.4, repeatType: 'mirror', delay: 0.2 }} className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 px-2 py-1 text-center">
                  <div className="text-[11px] text-gray-600 dark:text-gray-300">Closed Deals</div>
                  <div className="text-sm font-bold text-green-600 dark:text-green-300">4</div>
                </motion.div>
              </div>
           
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex-1 flex flex-col justify-end">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Sales Insights</div>
                <div className="flex items-end h-24 gap-2 w-full">
                  <motion.div animate={{ height: [32, 64, 32] }} transition={{ repeat: Infinity, duration: 2, repeatType: 'mirror', delay: 0 }} className="w-6 rounded bg-orange-400/80 dark:bg-orange-600/80" style={{ height: 48 }} />
                  <motion.div animate={{ height: [64, 32, 64] }} transition={{ repeat: Infinity, duration: 2.1, repeatType: 'mirror', delay: 0.1 }} className="w-6 rounded bg-blue-400/80 dark:bg-blue-600/80" style={{ height: 36 }} />
                  <motion.div animate={{ height: [40, 72, 40] }} transition={{ repeat: Infinity, duration: 2.2, repeatType: 'mirror', delay: 0.2 }} className="w-6 rounded bg-green-400/80 dark:bg-green-600/80" style={{ height: 60 }} />
                  <motion.div animate={{ height: [52, 28, 52] }} transition={{ repeat: Infinity, duration: 2.3, repeatType: 'mirror', delay: 0.3 }} className="w-6 rounded bg-gray-300/80 dark:bg-gray-700/80" style={{ height: 32 }} />
                  <motion.div animate={{ height: [28, 52, 28] }} transition={{ repeat: Infinity, duration: 2.4, repeatType: 'mirror', delay: 0.4 }} className="w-6 rounded bg-yellow-300/80 dark:bg-yellow-600/80" style={{ height: 40 }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                </div>
              </motion.div>
            
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.4, repeatType: "mirror" }} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-orange-300/30 dark:bg-orange-700/30 blur-2xl rounded-full" />
             
              <Smartphone className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-24 text-orange-400 dark:text-orange-600 opacity-20" />
            </div>
          </motion.div>
        </motion.div> */}
        <motion.div
          className="flex-1 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none px-2 sm:px-4 lg:px-0"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          viewport={{ once: true }}
        >
          <SeamlessIntegrations />
        </motion.div>
      </div>
    </section>
  );
}
