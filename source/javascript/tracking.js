//Tracking will be disabled if the user doesn't have JS enabled.
(function() {
    'use strict';

    //De-minified script injection for Google Analytics
    var startTrack = function () {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'gtm.start' : new Date().getTime(),
            'event' : 'gtm.js',
        });

        var firstScript = document.getElementsByTagName('script')[0],
            injection = document.createElement('script');

        injection.async = true;
        injection.src='//www.googletagmanager.com/gtm.js?id=GTM-5GNFPT&l=dataLayer';
        firstScript.parentNode.insertBefore(injection, firstScript);
    };

    var isDNT = function () {
        //Optional user override
        if ((localStorage && localStorage.getItem('crawlspace') || {}).enableUserTracking) {
            return false;
        }

        //Default validation
        return window.navigator.doNotTrack === "1" || //Modern browsers
                window.doNotTrack === "1" || //IE11
                window.navigator.msDoNotTrack === "1" || //IE9/10
                window.navigator.doNotTrack === "yes"; //Pre-Gecko 32 Firefox
    };

    //Init
    if (isDNT()) {
        console.log('skipping ad manager - DNT enabled');
        //Check local data
    } else {
        startTrack();
    }

}());
