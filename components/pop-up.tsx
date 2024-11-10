// "use client";

// import { useState, useEffect } from "react";

// export function PopupOverlay() {
//   const [isVisible, setIsVisible] = useState(true);
//   const [isFading, setIsFading] = useState(false);
//   const [isEntering, setIsEntering] = useState(true);

//   useEffect(() => {
//     // Adjusted timing for a quicker entrance (100ms instead of 500ms)
//     const entranceTimer = setTimeout(() => {
//       setIsEntering(false);
//     }, 10); // Entrance effect happens much sooner

//     const fadeTimer = setTimeout(() => {
//       setIsFading(true);
//     }, 2500); // Fade-out effect after 2.5 seconds

//     const hideTimer = setTimeout(() => {
//       setIsVisible(false);
//     }, 3000); // Hide after 3 seconds

//     return () => {
//       clearTimeout(entranceTimer);
//       clearTimeout(fadeTimer);
//       clearTimeout(hideTimer);
//     };
//   }, []);

//   if (!isVisible) return null;

//   return (
//     <div
//       className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
//         isFading ? "opacity-0" : "opacity-100"
//       }`}
//     >
//       {/* Overlay with different styles for dark mode */}
//       <div
//         className={`bg-black bg-opacity-50 dark:bg-white dark:bg-opacity-40 flex items-center justify-center fixed inset-0`}
//       ></div>

//       <div
//         className={`bg-white dark:bg-gray-800 h-[40vh] p-6 rounded-lg shadow-lg max-w-sm w-[60vw] transition-all duration-500 transform ${
//           isEntering
//             ? "opacity-0 scale-90" // Quick entrance: Fade-in and scale-up
//             : isFading
//             ? "opacity-0 scale-90" // Fade out and scale down on close
//             : "opacity-100 scale-100" // Fully visible pop-up box
//         }`}
//       >
//         <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
//           Your Guide to Every sort of Adventures!!!
//         </h2>
//         <img src="/images/leaf.png" alt="" />
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";

export function PopupOverlay() {
  const [isVisible, setIsVisible] = useState(false); // Start as invisible
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Delay visibility to trigger animation smoothly
    const showPopupTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10); // Small delay for entrance

    const fadeTimer = setTimeout(() => {
      setIsFading(true); // Start fading after 2.5 seconds
    }, 2500);

    const hideTimer = setTimeout(() => {
      setIsVisible(false); // Hide after 3 seconds
    }, 3000);

    return () => {
      clearTimeout(showPopupTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="bg-black bg-opacity-50 dark:bg-white dark:bg-opacity-40 fixed inset-0"></div>

        <div
          className={`bg-white dark:bg-gray-800 h-[40vh] p-6 rounded-lg shadow-lg max-w-sm w-[60vw] transform transition-all duration-500 ${
            isFading
              ? "animate-foldSlideDown" // Exit animation
              : "animate-slideUpAndScale" // Entrance animation
          }`}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Your Guide to Every sort of Adventures!!!
          </h2>
          <img src="/images/leaf.png" alt="" />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUpAndScale {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes foldSlideDown {
          0% {
            transform: scaleY(1) translateY(0);
          }
          100% {
            transform: scaleY(0.9) translateY(150px);
          }
        }

        .animate-slideUpAndScale {
          animation: slideUpAndScale 0.5s ease-out forwards;
        }

        .animate-foldSlideDown {
          animation: foldSlideDown 0.5s ease-in forwards;
        }
      `}</style>
    </>
  );
}
