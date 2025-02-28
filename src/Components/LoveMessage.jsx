import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const message = [
  "Hey love,",
  "I know you're carrying so much on your shoulders right now...",
  "You're handling everything—your business, the house, the gym, Steffie and the roka—on your own, and that takes incredible strength.",
  "I can't imagine how exhausting it must be, but I want you to know that you’re doing amazing.",
  "I’m so proud of you, and I know that no matter how tough things feel right now, you’ll get through this.",
  "Just hang in there, okay? Everything will settle soon, and I’ll make sure you don’t have to go through it alone.",
  "You're beautiful inside and out, and no amount of stress or weight loss can change that.",
  "I’ll be better for you too—I’ll take you out more, and I’ll give you the break you need. You deserve it.",
  "Just know that I’m here, always. 💙✨",
  "Love you. - Hulk ",
];

export default function LoveMessage() {
  const [reveal, setReveal] = useState(false);
  const [index, setIndex] = useState(0);

  const handleReveal = () => {
    if (!reveal) {
      setReveal(true);
      let i = 0;
      const interval = setInterval(() => {
        if (i < message.length) {
          setIndex((prev) => prev + 1);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 1500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50 p-4 relative overflow-hidden">
      {/* Floating Hearts */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-red-400"
          initial={{ opacity: 0, y: 100, scale: 0.5 }}
          animate={{ opacity: 1, y: -100, scale: 1 }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <Heart size={20} />
        </motion.div>
      ))}

      {/* Message Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-md relative z-10">
        {!reveal ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:bg-pink-600 transition"
            onClick={handleReveal}
          >
            Tap to Reveal 💌
          </motion.button>
        ) : (
          <div className="text-gray-800 text-lg font-medium leading-relaxed">
            {message.slice(0, index).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-2"
              >
                {line}
              </motion.p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
