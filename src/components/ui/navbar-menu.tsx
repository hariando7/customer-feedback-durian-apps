/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
// import { Button } from "./button";
import { Loader } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { FaInstagram } from "react-icons/fa";
import { FaFacebookSquare } from "react-icons/fa";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-primary hover:text-secondary hover:opacity-[0.9] font-bold pt-1 hover:underline hover:underline-offset-8 hover:transition hover:ease-in-out hover:delay-150 hover:duration-300 hover:-translate-y-1 hover:scale-110"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div layout className="w-max h-full p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFirstLoading, setIsFirstLoading] = useState(false);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const handleMouseEnter = () => {
    lettersRef.current.forEach((letter, index) => {
      if (letter) {
        letter.classList.add("fall");
        letter.style.animationDelay = `${index * 0.1}s`; // Ubah durasi sesuai kebutuhan
        letter.addEventListener(
          "animationend",
          () => {
            letter.classList.remove("fall");
          },
          { once: true }
        );
      }
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollTop > lastScrollTop && currentScrollTop > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);

  return (
    <>
      <div
        onMouseLeave={() => setActive(null)}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-input drop-shadow-xl md:rounded-none lg:w-full flex justify-between pl-8 pr-8 transition-transform duration-500 ease-in-out"
      >
        <div className="flex items-center justify-center text-white font-bold">
          <Image
            src="/assets/images/newLogo-removebg.png"
            width={100}
            height={50}
            alt="Percetakan Media"
            className=""
          />
        </div>
        <div className="flex justify-center space-x-6 py-6 px-8">
          {children}
        </div>
        <div className="flex items-center justify-center">
          <Link
            href="/login"
            onMouseEnter={handleMouseEnter}
            className="w-full text-[16px] text-center px-6 py-2 bg-gradient-to-r from-secondary to-secondary text-primary-foreground hover:text-line-10 hover:from-white hover:to-white hover:bg-gradient-to-r hover:text-secondary hover:border-2 hover:border-secondary rounded-lg cursor-pointer transition ease-in-out delay-150 duration-300 hover:-translate-y-1 hover:scale-110 hover:rotate-1 shadow-md hover:shadow-xl transform-gpu"
          >
            {isFirstLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <div className="flex gap-2">
                  {/* <span>
                    <BsWhatsapp className="w-6 h-6" />
                  </span> */}
                  <span className="animated-text flex justify-center font-bold">
                    {"Masuk".split("").map((letter, index) => (
                      <span
                        key={index}
                        ref={(el) => {
                          lettersRef.current[index] = el;
                        }}
                        className="letter transition-transform duration-300 hover:translate-y-[-5px] hover:rotate-[10deg] inline-block"
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                </div>
              </>
            )}
          </Link>
        </div>
      </div>

      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: showNavbar ? 0 : -140 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onMouseLeave={() => setActive(null)}
        className="fixed top-0 left-0 right-0 z-30 shadow-input md:rounded-none lg:w-full flex justify-between transition-transform duration-500 ease-in-out mt-[75px]"
      >
        <div className="bg-primary w-full h-full p-2">
          <div className="text-primary-foreground font-bold flex gap-2 justify-between">
            <div className="flex gap-2">
              <p>
                <FaInstagram className="w-6 h-6 text-white" />
              </p>
              <p>
                <FaFacebookSquare className="w-6 h-6 text-white" />
              </p>
              <p>
                <BsWhatsapp className="w-6 h-6 text-white" />
              </p>
            </div>
            {/* <p>Facbook</p> */}
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black">{title}</h4>
        <p className="text-neutral-700 text-sm max-w-[10rem]">{description}</p>
      </div>
    </Link>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black"
    >
      {children}
    </Link>
  );
};
