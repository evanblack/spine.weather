# Poncho Weather App

Poncho is a dead simple mobile web app for viewing current and next-day weather conditions. It works on Android and iOS, although it's tailored for non-tablet smartphone devices like Android phones, iPhone and iPod Touch. It's a mobile web app instead of a native app, so it may work on even more platforms, but I haven't tested it on anything else. If you go to app.getponcho.com on your device's browser, you can bookmark and/or add the app to your homescreen and run it virtually just like a native app.

It runs mainly on [Spine](http://maccman.github.com/spine/), a lightweight MVC javascript framework for building web applications. Instead of the bloated jQuery, it uses the more lightweight and mobile-geared [Zepto](http://zeptojs.com/) framework. It uses YQL (Yahoo Query Language) as the weather API to pull the current weather conditions and also uses HTML5 LocalStorage to store the user's locations. I needed to choose a javascript templating language as an efficient way to display the data. Javascript templates are in Mustache (http://mustache.github.com/) because of it's small size and efficient rendering.

Check out the full blog post on my [website](http://www.evanblack.com/blog/introducing-poncho-a-simple-weather-app-for-android-and-iphone/)

Note: Poncho's weather icons are the awesome Mobydock icons by [Wojciech Grzanka](http://voogee.deviantart.com/art/Grzanka-s-Icons-nr-2-44204272)