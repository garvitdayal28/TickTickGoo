import { useEffect } from "react";

const AndroidKeyboardHandler = () => {
  useEffect(() => {
    // Handle Android keyboard visibility
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Handle viewport changes on Android
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const handleViewportResize = () => {
          document.documentElement.style.setProperty(
            "--viewport-height",
            `${viewport.height}px`
          );
        };

        viewport.addEventListener("resize", handleViewportResize);
        handleViewportResize();

        return () => {
          viewport.removeEventListener("resize", handleViewportResize);
        };
      }
    };

    // Initial setup
    handleResize();
    handleViewportChange();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return null;
};

export default AndroidKeyboardHandler;
