import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  BarChart2,
  Cpu,
  Users,
  Smile,
  Repeat,
  TrendingUp,
} from 'lucide-react';
import SeamlessIntegrations from './SeamlessIntegrations';

const features = [
  {
    icon: <Cpu className="text-orange-500 w-7 h-7" />,
    title: 'Tools that fit your work',
    desc: 'Software that matches your process, so teams spend less time on busywork and more on real results.',
  },
  {
    icon: <BarChart2 className="text-blue-500 w-7 h-7" />,
    title: 'Clear, simple insights',
    desc: "See what's working and what needs attention—without digging through heavy reports.",
  },
  {
    icon: <Users className="text-green-500 w-7 h-7" />,
    title: 'Keep customers close',
    desc: 'Track conversations and follow‑ups in one place so nothing slips.',
  },
  {
    icon: <Smile className="text-pink-500 w-7 h-7" />,
    title: 'Built around people',
    desc: 'Plain‑language screens, quick support, and tidy workflows help teams adopt fast.',
  },
  {
    icon: <Repeat className="text-indigo-500 w-7 h-7" />,
    title: 'We stay with you',
    desc: 'From setup to everyday use, we help you get value and keep improving over time.',
  },
  {
    icon: <TrendingUp className="text-yellow-500 w-7 h-7" />,
    title: 'Room to grow',
    desc: 'Add modules and users as you scale—without starting over.',
  },
];

export default function HowHelpingCompanies() {
  return (
    <section className="relative py-12 sm:py-20 md:py-28 bg-gradient-to-br from-white via-orange-50 to-purple-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-gray-900 dark:to-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-16 flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
        {/* Left: Features */}
        <div className="flex-1 w-full space-y-8">
          <motion.h2
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent leading-tight pb-2 drop-shadow-md"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.25, 0.25, 1.25],
              type: 'spring',
              stiffness: 100,
            }}
            viewport={{ once: true, margin: '-100px' }}
          >
            How we help companies
            <motion.span
              className="block mt-2 text-gray-700 dark:text-orange-200 font-normal text-lg sm:text-xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.7,
                ease: 'easeOut',
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
              ease: 'easeOut',
            }}
            viewport={{ once: true }}
          >
            We help sales and distribution teams work faster and with more clarity. Here's where we
            make a difference:
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
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }}
                viewport={{ once: true, margin: '-50px' }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 backdrop-blur-sm transition-colors duration-200 cursor-pointer"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 + i * 0.1,
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 150,
                    damping: 15,
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
                    ease: [0.25, 0.25, 0.25, 1],
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
                      ease: 'easeOut',
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
                        ease: 'backOut',
                      }}
                      viewport={{ once: true }}
                      whileHover={{
                        scale: 1.2,
                        rotate: 360,
                        transition: { duration: 0.2, ease: 'easeOut' },
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
                      ease: 'easeOut',
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

        {/* Right: Seamless Integrations (replaces Smartphone animation) */}
        <motion.div
          className="flex-1 flex justify-center items-center w-full max-w-xl sm:mt-10 lg:mt-0"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          viewport={{ once: true }}
        >
          <SeamlessIntegrations />
        </motion.div>
      </div>
    </section>
  );
}
