interface UmamiEventData {
  [key: string]: string | number | boolean | object;
}

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: UmamiEventData) => void;
    };
  }
}

export const trackEvent = (eventName: string, data?: UmamiEventData) => {
  if (window.umami) {
    window.umami.track(eventName, data);
  } else {
    console.warn("Umami is not loaded");
  }
};