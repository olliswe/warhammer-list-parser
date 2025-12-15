import { useState, useEffect } from "react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

function InstallButton() {
  const { isInstallable, isIOS, handleInstall } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isInstallable || !isMobile) return null;

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSInstructions(true)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Install App
        </button>

        {showIOSInstructions && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
            onClick={() => setShowIOSInstructions(false)}
          >
            <div
              className="bg-white rounded-t-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-3">Install ListBin</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>To install this app on your iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Tap the <strong>Share</strong> button at the bottom of
                    Safari
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top right
                  </li>
                </ol>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className="text-blue-600 hover:text-blue-700 font-medium"
    >
      Install App
    </button>
  );
}

export default InstallButton;