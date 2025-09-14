"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  easeInOut,
} from "framer-motion";
import styles from "./AnimatedSlider.module.css";
// import styles from "./style.css";
interface SlideData {
  id: number;
  image: string;
  name: string;
  location: string;
  description: string;
}

const AnimatedSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Debug option - set to false to skip loading
  const ENABLE_LOADING = false; // Disabled for now to see slider immediately

  // Motion values for card rotation
  const mouseX = useMotionValue(0);
  const cardRotateY = useTransform(mouseX, [-200, 200], [-25, 25]);

  const slides: SlideData[] = [
    {
      id: 1,
      image: "https://picsum.photos/800/600?random=1",
      name: "Highlands",
      location: "Scotland",
      description: "The mountains are calling",
    },
    {
      id: 2,
      image: "https://picsum.photos/800/600?random=2",
      name: "Machu Pichu",
      location: "Peru",
      description: "Adventure is never far away",
    },
    {
      id: 3,
      image: "https://picsum.photos/800/600?random=3",
      name: "Chamonix",
      location: "France",
      description: "Let your dreams come true",
    },
  ];

  const getSlideIndex = (offset: number) => {
    return (currentIndex + offset + slides.length) % slides.length;
  };

  const getCurrentSlide = () => slides[currentIndex];
  const getPreviousSlide = () => slides[getSlideIndex(-1)];
  const getNextSlide = () => slides[getSlideIndex(1)];

  const swapCards = useCallback(
    async (newDirection: "left" | "right") => {
      if (isAnimating) {
        return;
      }

      setIsAnimating(true);
      setDirection(newDirection);

      // Immediately change index without delay
      if (newDirection === "right") {
        setCurrentIndex(getSlideIndex(1));
      } else {
        setCurrentIndex(getSlideIndex(-1));
      }

      // Wait for animation to complete - consistent timing
      setTimeout(() => {
        setIsAnimating(false);
      }, 800); // Match the animation duration exactly
    },
    [currentIndex, isAnimating]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const offsetX = e.clientX - centerX;
    mouseX.set(offsetX);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
  };

  const waitForImages = () => {
    const images = slides.map((slide) => slide.image);
    let loadedImages = 0;
    const totalImages = images.length;

    // Add timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoadProgress(1);
      setIsLoading(false);
    }, 10000); // 10 second timeout

    const handleImageComplete = () => {
      loadedImages++;
      const progress = loadedImages / totalImages;
      setLoadProgress(progress);

      if (loadedImages === totalImages) {
        clearTimeout(timeoutId);
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    images.forEach((imageSrc, index) => {
      const img = new Image();

      img.onload = () => {
        handleImageComplete();
      };

      img.onerror = (error) => {
        console.warn(`❌ Image ${index + 1} failed to load:`, imageSrc, error);
        // Still count as "loaded" to prevent hanging
        handleImageComplete();
      };

      // Add crossOrigin for external images
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
    });

    // If no images, complete immediately
    if (totalImages === 0) {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!ENABLE_LOADING) {
      setIsLoading(false);
      return;
    }

    waitForImages();
  }, []);

  // Animation variants for slide-in/slide-out effect
  const cardVariants = {
    // Card entering from right (for next button)
    enterFromRight: {
      x: 500,
      rotateY: -45,
      scale: 0.8,
      opacity: 0,
      zIndex: 10,
    },
    // Card entering from left (for previous button)
    enterFromLeft: {
      x: -500,
      rotateY: 45,
      scale: 0.8,
      opacity: 0,
      zIndex: 10,
    },
    // Current active card in center
    center: {
      x: 0,
      rotateY: 0,
      scale: 1.2,
      opacity: 1,
      zIndex: 30,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
    // Next card on the right
    right: {
      x: 270,
      rotateY: -30, // Sử dụng giá trị tương ứng với CSS
      scale: 0.9,
      opacity: 0.4, // Sử dụng opacity từ CSS variables
      zIndex: 10,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
    // Previous card on the left
    left: {
      x: -270,
      rotateY: 30, // Sử dụng giá trị tương ứng với CSS
      scale: 0.9,
      opacity: 0.4, // Sử dụng opacity từ CSS variables
      zIndex: 10,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
    // Card exiting to left (when going right/next)
    exitToLeft: {
      x: -500,
      rotateY: 45,
      scale: 0.8,
      opacity: 0,
      zIndex: 10,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
    // Card exiting to right (when going left/previous)
    exitToRight: {
      x: 500,
      rotateY: -45,
      scale: 0.8,
      opacity: 0,
      zIndex: 10,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
  };

  const loadingVariants = {
    initial: {
      y: "100vh",
      transition: {
        duration: 0.5,
        ease: easeInOut, // Using imported easing function
      },
    },
    animate: {
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeInOut, // Using imported easing function
        delay: 0.15,
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8, // Đồng bộ với card animation
        ease: easeInOut,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -120,
      transition: {
        delay: i * 0.1,
        duration: 0.8, // Đồng bộ với card animation
        ease: easeInOut,
      },
    }),
  };

  const backgroundVariants = {
    current: {
      opacity: 1,
      x: "0%",
      transition: {
        duration: 0.8, // Đồng bộ với card animation
        ease: easeInOut,
      },
    },
    next: {
      opacity: 0,
      x: "25%",
      transition: {
        duration: 0.8, // Đồng bộ với card animation
        ease: easeInOut,
      },
    },
    previous: {
      opacity: 0,
      x: "-25%",
      transition: {
        duration: 0.8, // Đồng bộ với card animation
        ease: easeInOut,
      },
    },
  };

  const buttonVariants = {
    disabled: {
      opacity: 0.5,
      pointerEvents: "none" as const,
    },
    enabled: {
      opacity: 1,
      pointerEvents: "all" as const,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className={styles.app}>
      <div className={styles.cardList}>
        <motion.button
          className={`${styles.cardList__btn} ${styles.btn} ${styles["btn--left"]}`}
          onClick={() => swapCards("left")}
          variants={buttonVariants}
          animate={isAnimating ? "disabled" : "enabled"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={styles.icon}>
            <svg viewBox="0 0 512 512" width="24" height="24">
              <polyline
                points="328 112 184 256 328 400"
                style={{
                  fill: "none",
                  stroke: "#fff",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "48px",
                }}
              />
            </svg>
          </div>
        </motion.button>

        <div className={styles.cards__wrapper}>
          <AnimatePresence mode="wait">
            {/* Current card với animation đúng direction */}
            <motion.div
              key={`current-${currentIndex}`}
              className={`${styles.card} ${styles["current--card"]}`}
              variants={cardVariants}
              initial={
                direction === "right" ? "enterFromRight" : "enterFromLeft"
              }
              animate="center"
              exit={direction === "right" ? "exitToLeft" : "exitToRight"}
              style={{ rotateY: cardRotateY }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.card__image}>
                <img
                  src={getCurrentSlide().image}
                  alt={getCurrentSlide().name}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next card - luôn hiển thị bên phải */}
          <motion.div
            key={`next-${getSlideIndex(1)}`}
            className={`${styles.card} ${styles["next--card"]}`}
            variants={cardVariants}
            animate="right"
          >
            <div className={styles.card__image}>
              <img src={getNextSlide().image} alt={getNextSlide().name} />
            </div>
          </motion.div>

          {/* Previous card - luôn hiển thị bên trái */}
          <motion.div
            key={`previous-${getSlideIndex(-1)}`}
            className={`${styles.card} ${styles["previous--card"]}`}
            variants={cardVariants}
            animate="left"
          >
            <div className={styles.card__image}>
              <img
                src={getPreviousSlide().image}
                alt={getPreviousSlide().name}
              />
            </div>
          </motion.div>
        </div>

        <motion.button
          className={`${styles.cardList__btn} ${styles.btn} ${styles["btn--right"]}`}
          onClick={() => swapCards("right")}
          variants={buttonVariants}
          animate={isAnimating ? "disabled" : "enabled"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={styles.icon}>
            <svg viewBox="0 0 512 512" width="24" height="24">
              <polyline
                points="184 112 328 256 184 400"
                style={{
                  fill: "none",
                  stroke: "#fff",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "48px",
                }}
              />
            </svg>
          </div>
        </motion.button>
      </div>

      <div className={styles.infoList}>
        <div className={styles.info__wrapper}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`current-${currentIndex}`}
              className={`${styles.info} ${styles["current--info"]}`}
              style={{ rotateY: cardRotateY }}
            >
              <motion.h1
                className={`${styles.text} ${styles.name}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={0}
              >
                {getCurrentSlide().name}
              </motion.h1>
              <motion.h4
                className={`${styles.text} ${styles.location}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={1}
              >
                {getCurrentSlide().location}
              </motion.h4>
              <motion.p
                className={`${styles.text} ${styles.description}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={2}
              >
                {getCurrentSlide().description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.app__bg}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-current-${currentIndex}`}
            className={`${styles.app__bg__image} ${styles["current--image"]}`}
            variants={backgroundVariants}
            initial={direction === "right" ? "next" : "previous"}
            animate="current"
            exit={direction === "right" ? "previous" : "next"}
          >
            <img src={getCurrentSlide().image} alt={getCurrentSlide().name} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={styles.loading__wrapper}
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.8 },
            }}
          >
            <div className={styles["loader--text"]}>Loading...</div>
            <div className={styles.loader}>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: loadProgress,
                  backgroundColor: `hsl(${loadProgress * 120}, 100%, 50%)`,
                }}
                transition={{ duration: 1 }}
                style={{ transformOrigin: "left" }}
              />
            </div>
            {/* Debug info and skip button */}
            <div
              style={{
                marginTop: "20px",
                color: "white",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              <p>Progress: {Math.round(loadProgress * 100)}%</p>
              <button
                onClick={() => {
                  setIsLoading(false);
                }}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid white",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Skip Loading
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedSlider;
