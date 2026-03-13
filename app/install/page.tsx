"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Button from "@/components/shared/Button";

type Platform = "ios" | "android" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    // Capture Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-teal-light rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-teal-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">App Installed!</h1>
          <p className="text-sm text-gray-500">CommandBase is ready. You can find it on your home screen.</p>
          <Button onClick={() => window.location.href = "/worker/login"} className="w-full">
            Open App
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-sm mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto">
            <Image src="/icon-192.png" alt="CommandBase" width={80} height={80} className="rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Install CommandBase</h1>
          <p className="text-sm text-gray-500">
            Add the app to your home screen for quick access to your tasks.
          </p>
        </div>

        {/* iOS Instructions */}
        {platform === "ios" && (
          <div className="space-y-6">
            <Step number={1} title="Tap the Share button">
              <p className="text-sm text-gray-500 mb-3">
                Tap the share icon at the bottom of Safari (the square with an arrow pointing up).
              </p>
              <div className="bg-gray-50 rounded-card p-4 flex justify-center">
                <svg className="w-10 h-10 text-purple-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </Step>

            <Step number={2} title='Scroll down and tap "Add to Home Screen"'>
              <p className="text-sm text-gray-500 mb-3">
                Scroll through the share menu options until you see the home screen icon.
              </p>
              <div className="bg-gray-50 rounded-card p-4">
                <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Add to Home Screen</span>
                </div>
              </div>
            </Step>

            <Step number={3} title='Tap "Add" in the top right'>
              <p className="text-sm text-gray-500">
                Confirm by tapping <span className="font-medium text-purple-primary">Add</span>. The app will appear on your home screen.
              </p>
            </Step>

            <div className="bg-amber-light rounded-card p-4">
              <p className="text-xs text-amber-primary font-medium">
                Note: You must use Safari for this to work. If you opened this link in another browser, copy the URL and paste it into Safari.
              </p>
            </div>
          </div>
        )}

        {/* Android Instructions */}
        {platform === "android" && (
          <div className="space-y-6">
            {deferredPrompt ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 text-center">
                  Tap the button below to install CommandBase on your device.
                </p>
                <Button onClick={handleAndroidInstall} size="lg" className="w-full">
                  Install App
                </Button>
              </div>
            ) : (
              <>
                <Step number={1} title="Tap the menu button">
                  <p className="text-sm text-gray-500 mb-3">
                    Tap the three dots <span className="font-mono font-bold">&#8942;</span> in the top-right corner of Chrome.
                  </p>
                  <div className="bg-gray-50 rounded-card p-4 flex justify-center">
                    <svg className="w-10 h-10 text-purple-primary" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </div>
                </Step>

                <Step number={2} title='Tap "Install app" or "Add to Home screen"'>
                  <p className="text-sm text-gray-500 mb-3">
                    Look for the install option in the dropdown menu.
                  </p>
                  <div className="bg-gray-50 rounded-card p-4">
                    <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">Install app</span>
                    </div>
                  </div>
                </Step>

                <Step number={3} title='Tap "Install" to confirm'>
                  <p className="text-sm text-gray-500">
                    The app will download and appear on your home screen.
                  </p>
                </Step>
              </>
            )}
          </div>
        )}

        {/* Desktop */}
        {platform === "desktop" && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 text-center">
              Open this page on your phone to install the app. Or use the install button in your browser&apos;s address bar.
            </p>
            <Step number={1} title="Look for the install icon">
              <p className="text-sm text-gray-500">
                In Chrome, click the install icon in the address bar (a monitor with a down arrow), then click <span className="font-medium">Install</span>.
              </p>
            </Step>
          </div>
        )}

        {platform === "unknown" && (
          <div className="text-center">
            <p className="text-sm text-gray-400">Detecting your device...</p>
          </div>
        )}

        {/* Skip to app */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <a href="/worker/login" className="text-sm text-purple-primary hover:underline">
            Skip — open in browser instead
          </a>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
        {children}
      </div>
    </div>
  );
}
