import React from "react";
import { motion } from "framer-motion";

const SplitText = ({ text, className = "", delay = 0, tag: Tag = "div" }) => {
  const lines = text.split("\n");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.01, delayChildren: delay }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <Tag className={className}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6, margin: "0px 0px -100px 0px" }}
        className="inline-block"
      >
        {lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line.split(" ").map((word, wordIndex) => (
              <motion.span
                key={`${lineIndex}-${wordIndex}`}
                variants={wordVariants}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
            {lineIndex < lines.length - 1 && <br className="hidden md:block" />}
          </React.Fragment>
        ))}
      </motion.div>
    </Tag>
  );
};

export default SplitText;
