import mixpanel from "mixpanel-browser";

// Initialize Mixpanel only once
mixpanel.init("d985d0db6bea75c6ec96daf77c42d443", {
    debug: true, // optional: remove in production
    track_pageview: true,
});

export default mixpanel;