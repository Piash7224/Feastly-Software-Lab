import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

// Table settings configuration - ellipse layout
const tableItems = [
  ...[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
    const radiusX = 210;
    const radiusY = 140;
    const radian = (angle * Math.PI) / 180;

    const plateX = Math.cos(radian) * radiusX;
    const plateY = Math.sin(radian) * radiusY;

    const glassX = Math.cos(radian) * (radiusX - 28);
    const glassY = Math.sin(radian) * (radiusY - 14);

    return [
      { type: "plate", x: plateX, y: plateY },
      { type: "glass", x: glassX, y: glassY },
    ];
  }).flat(),
];

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (name && role) setUser({ name, role });
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-800 text-white flex flex-col">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full px-4 md:px-8 text-center flex flex-col items-center"
      >
        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent"
        >
          Discover & Connect with the Best Restaurants
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 mb-12"
        >
          Find your next culinary adventure with Feastly's curated selection of
          top-rated restaurants in your area.
        </motion.p>

        {/* Centered Table Illustration */}
        <motion.div
          className="relative h-80 mb-16 w-full flex justify-center items-center"
          initial="hidden"
          animate="visible"
        >
          {/* Floating Oval Table */}
          <motion.div
            className="absolute left-[38%] top-[20%] -translate-x-1/3 -translate-y-1/4"
            animate={{
              y: [0, -3, 0],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="w-[22rem] h-48 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[100px] shadow-xl relative">
              <div className="absolute -left-2 bottom-0 w-4 h-16 bg-orange-700 rounded-full transform -rotate-12" />
              <div className="absolute -right-2 bottom-0 w-4 h-16 bg-orange-700 rounded-full transform rotate-12" />
            </div>
          </motion.div>

          {/* Plates & Glasses */}
          {tableItems.map((item, index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2"
              style={{ x: "-50%", y: "-50%" }}
              initial={{
                translateX: `${item.x}px`,
                translateY: `${item.y}px`,
              }}
              animate={{
                translateX: [`${item.x - 2}px`, `${item.x + 2}px`, `${item.x - 2}px`],
                translateY: [`${item.y - 2}px`, `${item.y + 2}px`, `${item.y - 2}px`],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.1,
              }}
            >
              {item.type === "plate" ? (
                <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-100" />
                </div>
              ) : (
                <div className="w-6 h-8 bg-red-500/80 rounded-t-lg rounded-b-sm" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        
      </motion.div>
    </div>
  );
}
