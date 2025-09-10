"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./GSAPSlider.module.css";
import { Button } from "../ui/button";

interface SlideData {
  id: number;
  image: string;
  name: string;
  location: string;
  description: string;
}

const GSAPSlider: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Refs for GSAP animations
  const appRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const appBgContainerRef = useRef<HTMLDivElement>(null);
  const cardInfosContainerRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const loaderRef = useRef<HTMLSpanElement>(null);

  const slides: SlideData[] = [
    {
      id: 1,
      image: "https://picsum.photos/800/600?random=1",
      name: "Đà Lạt",
      location: "Việt Nam",
      description: "The mountains are calling",
    },
    {
      id: 2,
      image: "/images/Saigon1.PNG",
      name: "Hồ Chí Minh City",
      location: "Việt Nam",
      description: "Adventure is never far away",
    },
    {
      id: 3,
      image: "https://picsum.photos/800/600?random=3",
      name: "Đà Nẵng City",
      location: "Việt Nam",
      description: "Let your dreams come true",
    },
  ];

  // GSAP Animation Functions
  const swapCards = (direction: "left" | "right") => {
    if (
      !cardsContainerRef.current ||
      !appBgContainerRef.current ||
      !cardInfosContainerRef.current
    )
      return;

    const currentCardEl = cardsContainerRef.current.querySelector(
      `.${styles.currentCard}`
    ) as HTMLElement;
    const previousCardEl = cardsContainerRef.current.querySelector(
      `.${styles.previousCard}`
    ) as HTMLElement;
    const nextCardEl = cardsContainerRef.current.querySelector(
      `.${styles.nextCard}`
    ) as HTMLElement;

    const currentBgImageEl = appBgContainerRef.current.querySelector(
      `.${styles.currentImage}`
    ) as HTMLElement;
    const previousBgImageEl = appBgContainerRef.current.querySelector(
      `.${styles.previousImage}`
    ) as HTMLElement;
    const nextBgImageEl = appBgContainerRef.current.querySelector(
      `.${styles.nextImage}`
    ) as HTMLElement;

    if (
      !currentCardEl ||
      !previousCardEl ||
      !nextCardEl ||
      !currentBgImageEl ||
      !previousBgImageEl ||
      !nextBgImageEl
    )
      return;

    changeInfo(direction);
    swapCardsClass();

    removeCardEvents(currentCardEl);

    function swapCardsClass() {
      // Remove current classes
      currentCardEl.classList.remove(styles.currentCard);
      previousCardEl.classList.remove(styles.previousCard);
      nextCardEl.classList.remove(styles.nextCard);

      currentBgImageEl.classList.remove(styles.currentImage);
      previousBgImageEl.classList.remove(styles.previousImage);
      nextBgImageEl.classList.remove(styles.nextImage);

      // Set z-index
      currentCardEl.style.zIndex = "50";
      currentBgImageEl.style.zIndex = "-2";

      if (direction === "right") {
        previousCardEl.style.zIndex = "20";
        nextCardEl.style.zIndex = "30";
        nextBgImageEl.style.zIndex = "-1";

        // Add new classes
        currentCardEl.classList.add(styles.previousCard);
        previousCardEl.classList.add(styles.nextCard);
        nextCardEl.classList.add(styles.currentCard);

        currentBgImageEl.classList.add(styles.previousImage);
        previousBgImageEl.classList.add(styles.nextImage);
        nextBgImageEl.classList.add(styles.currentImage);
      } else if (direction === "left") {
        previousCardEl.style.zIndex = "30";
        nextCardEl.style.zIndex = "20";
        previousBgImageEl.style.zIndex = "-1";

        // Add new classes
        currentCardEl.classList.add(styles.nextCard);
        previousCardEl.classList.add(styles.currentCard);
        nextCardEl.classList.add(styles.previousCard);

        currentBgImageEl.classList.add(styles.nextImage);
        previousBgImageEl.classList.add(styles.currentImage);
        nextBgImageEl.classList.add(styles.previousImage);
      }
    }
  };

  const changeInfo = (direction: "left" | "right") => {
    if (!cardInfosContainerRef.current) return;

    const currentInfoEl = cardInfosContainerRef.current.querySelector(
      `.${styles.currentInfo}`
    ) as HTMLElement;
    const previousInfoEl = cardInfosContainerRef.current.querySelector(
      `.${styles.previousInfo}`
    ) as HTMLElement;
    const nextInfoEl = cardInfosContainerRef.current.querySelector(
      `.${styles.nextInfo}`
    ) as HTMLElement;

    if (!currentInfoEl || !previousInfoEl || !nextInfoEl) return;

    const tl = gsap.timeline();

    tl.to([prevButtonRef.current, nextButtonRef.current], {
      duration: 0.2,
      opacity: 0.5,
      pointerEvents: "none",
    })
      .to(
        currentInfoEl.querySelectorAll(".text"),
        {
          duration: 0.4,
          stagger: 0.1,
          translateY: "-120px",
          opacity: 0,
        },
        "-="
      )
      .call(() => {
        swapInfosClass(direction);
      })
      .call(() => initCardEvents())
      .fromTo(
        direction === "right"
          ? nextInfoEl.querySelectorAll(".text")
          : previousInfoEl.querySelectorAll(".text"),
        {
          opacity: 0,
          translateY: "40px",
        },
        {
          duration: 0.4,
          stagger: 0.1,
          translateY: "0px",
          opacity: 1,
        }
      )
      .to([prevButtonRef.current, nextButtonRef.current], {
        duration: 0.2,
        opacity: 1,
        pointerEvents: "all",
      });

    function swapInfosClass(direction: "left" | "right") {
      currentInfoEl.classList.remove(styles.currentInfo);
      previousInfoEl.classList.remove(styles.previousInfo);
      nextInfoEl.classList.remove(styles.nextInfo);

      if (direction === "right") {
        currentInfoEl.classList.add(styles.previousInfo);
        nextInfoEl.classList.add(styles.currentInfo);
        previousInfoEl.classList.add(styles.nextInfo);
      } else if (direction === "left") {
        currentInfoEl.classList.add(styles.nextInfo);
        nextInfoEl.classList.add(styles.previousInfo);
        previousInfoEl.classList.add(styles.currentInfo);
      }
    }
  };

  const updateCard = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const centerPosition = {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
    };
    const angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);

    gsap.set(card, {
      "--current-card-rotation-offset": `${angle}deg`,
    });

    const currentInfoEl = cardInfosContainerRef.current?.querySelector(
      `.${styles.currentInfo}`
    );
    if (currentInfoEl) {
      gsap.set(currentInfoEl, {
        rotateY: `${angle}deg`,
      });
    }
  };

  const resetCardTransforms = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const currentInfoEl = cardInfosContainerRef.current?.querySelector(
      `.${styles.currentInfo}`
    );

    gsap.set(card, {
      "--current-card-rotation-offset": 0,
    });

    if (currentInfoEl) {
      gsap.set(currentInfoEl, {
        rotateY: 0,
      });
    }
  };

  const initCardEvents = () => {
    if (!cardsContainerRef.current) return;
    const currentCardEl = cardsContainerRef.current.querySelector(
      `.${styles.currentCard}`
    ) as HTMLElement;
    if (currentCardEl) {
      // Remove existing listeners first
      currentCardEl.removeEventListener("pointermove", updateCard as any);
      currentCardEl.removeEventListener(
        "pointerout",
        resetCardTransforms as any
      );

      // Add new listeners
      currentCardEl.addEventListener("pointermove", updateCard as any);
      currentCardEl.addEventListener("pointerout", resetCardTransforms as any);
    }
  };

  const removeCardEvents = (card: HTMLElement) => {
    card.removeEventListener("pointermove", updateCard as any);
    card.removeEventListener("pointerout", resetCardTransforms as any);
  };

  const initAnimation = () => {
    if (!cardsContainerRef.current || !cardInfosContainerRef.current) return;

    const tl = gsap.timeline();

    tl.to(cardsContainerRef.current.children, {
      delay: 0.15,
      duration: 0.5,
      stagger: {
        ease: "power4.inOut",
        from: "start" as const,
        amount: 0.1,
      },
      "--card-translateY-offset": "0%",
    });

    const currentInfoTexts = cardInfosContainerRef.current
      .querySelector(".current--info")
      ?.querySelectorAll(".text");
    if (currentInfoTexts) {
      tl.to(currentInfoTexts, {
        delay: 0.5,
        duration: 0.4,
        stagger: 0.1,
        opacity: 1,
        translateY: 0,
      });
    }

    tl.to(
      [prevButtonRef.current, nextButtonRef.current],
      {
        duration: 0.4,
        opacity: 1,
        pointerEvents: "all",
      },
      "-=0.4"
    );
  };

  const waitForImages = () => {
    const images = slides.map((slide) => slide.image);
    let loadedImages = 0;
    const totalImages = images.length;

    // Set initial states
    if (cardsContainerRef.current) {
      gsap.set(cardsContainerRef.current.children, {
        "--card-translateY-offset": "100vh",
      });
    }

    if (cardInfosContainerRef.current) {
      const currentInfoTexts = cardInfosContainerRef.current
        .querySelector(".current--info")
        ?.querySelectorAll(".text");
      if (currentInfoTexts) {
        gsap.set(currentInfoTexts, {
          translateY: "40px",
          opacity: 0,
        });
      }
    }

    gsap.set([prevButtonRef.current, nextButtonRef.current], {
      pointerEvents: "none",
      opacity: 0,
    });

    images.forEach((imageSrc) => {
      const img = new Image();

      img.onload = () => {
        loadedImages++;
        const loadProgressValue = loadedImages / totalImages;
        setLoadProgress(loadProgressValue);

        if (loaderRef.current) {
          gsap.to(loaderRef.current, {
            duration: 1,
            scaleX: loadProgressValue,
            backgroundColor: `hsl(${loadProgressValue * 120}, 100%, 50%)`,
          });
        }

        if (totalImages === loadedImages) {
          gsap
            .timeline()
            .to(".loading__wrapper", {
              duration: 0.8,
              opacity: 0,
              pointerEvents: "none",
            })
            .call(() => {
              setIsLoading(false);
              initAnimation();
            });
        }
      };

      img.onerror = () => {
        // Handle error as successful load to prevent hanging
        loadedImages++;
        const loadProgressValue = loadedImages / totalImages;
        setLoadProgress(loadProgressValue);

        if (totalImages === loadedImages) {
          setIsLoading(false);
          initAnimation();
        }
      };

      img.src = imageSrc;
    });
  };

  useEffect(() => {
    waitForImages();
    initCardEvents();
  }, []);

  return (
    <div
      ref={appRef}
      style={{
        // backgroundImage: `url('/images/Saigon.jpg')`,
        // backgroundSize: "contain",
        backgroundColor: "#fff",
      }}
      className={`${styles.app} !max-h-[calc(100vh-80px)] !overflow-hidden relative`}
    >
      {/* Background overlay để làm tối background */}
      <div
        className={`${styles.backgroundOverlay} ${styles.mediumOverlay} `}
      ></div>
      <div
        className="flex-1 h-full flex-center !px-4 relative"
        style={{ zIndex: 2 }}
      >
        <div className=" tracking-wide  ">
          <h1 className="font-extrabold tracking-wide  text-[3rem] text-black">
            <span className="bg-primary-500  text-white p-2">Adventure</span>{" "}
            Starts With{" "}
          </h1>
          <h1 className="mt-4 font-extrabold tracking-wide text-[3rem] text-black">
            The Right Gear No
          </h1>
          <h1 className="mt-4 font-extrabold tracking-wide text-[3rem] text-black">
            Execuses{" "}
            <span className="bg-[#4eb5ff] text-white p-2">No Limits</span>
          </h1>
          <p>
            Whether you're chasing elk through rugged terrain or settingup camp
          </p>
          <p>uderr the stars -- we're got your back with gear that performs</p>
          <Button className="!bg-primary-500 !mt-8 font-bold text-[1rem] text-white h-[40px] !p-[12px]">
            Explore the world{" "}
          </Button>
        </div>
      </div>
      <div className="flex-1 relative" style={{ zIndex: 2 }}>
        <div className={styles.cardList}>
          <button
            ref={prevButtonRef}
            className={`${styles.cardList__btn} ${styles.btn} ${styles["btn--left"]}`}
            onClick={() => swapCards("left")}
          >
            <div className={styles.icon}>
              <svg>
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
          </button>

          <div ref={cardsContainerRef} className={styles.cards__wrapper}>
            <div
              className={`${styles.card}  ${styles.currentCard} !text-primary-500`}
            >
              <div className={styles.card__image}>
                <img src={slides[0].image} alt={slides[0].name} />
              </div>
            </div>

            <div className={`${styles.card} ${styles.nextCard}`}>
              <div className={styles.card__image}>
                <img src={slides[1].image} alt={slides[1].name} />
              </div>
            </div>

            <div className={`${styles.card} ${styles.previousCard}`}>
              <div className={styles.card__image}>
                <img src={slides[2].image} alt={slides[2].name} />
              </div>
            </div>
          </div>

          <button
            ref={nextButtonRef}
            className={`${styles.cardList__btn} ${styles.btn} ${styles["btn--right"]}`}
            onClick={() => swapCards("right")}
          >
            <div className={styles.icon}>
              <svg>
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
          </button>
        </div>

        <div ref={cardInfosContainerRef} className={`${styles.infoList}`}>
          <div className={styles.info__wrapper}>
            <div
              className={`${styles.info}  ${styles.currentInfo} !text-primary-500`}
            >
              <h1 className="text name ">{slides[0].name}</h1>
              <h4 className="text location">{slides[0].location}</h4>
              <p className="text description">{slides[0].description}</p>
            </div>

            <div className={`${styles.info} ${styles.nextInfo}`}>
              <h1 className="text name">{slides[1].name}</h1>
              <h4 className="text location">{slides[1].location}</h4>
              <p className="text description">{slides[1].description}</p>
            </div>

            <div className={`${styles.info} ${styles.previousInfo}`}>
              <h1 className="text name">{slides[2].name}</h1>
              <h4 className="text location">{slides[2].location}</h4>
              <p className="text description">{slides[2].description}</p>
            </div>
          </div>
        </div>

        <div ref={appBgContainerRef} className={styles.app__bg}>
          <div className={`${styles.app__bg__image} ${styles.currentImage}`}>
            <img src={slides[0].image} alt={slides[0].name} />
          </div>
          <div className={`${styles.app__bg__image} ${styles.nextImage}`}>
            <img src={slides[1].image} alt={slides[1].name} />
          </div>
          <div className={`${styles.app__bg__image} ${styles.previousImage}`}>
            <img src={slides[2].image} alt={slides[2].name} />
          </div>
        </div>

        {isLoading && (
          <div className={`${styles.loading__wrapper} loading__wrapper`}>
            <div className={styles["loader--text"]}>Loading...</div>
            <div className={styles.loader}>
              <span ref={loaderRef}></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GSAPSlider;
