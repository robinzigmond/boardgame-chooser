# Which Game to Play?

A fairly simple web app designed to help boardgamers choose which game to play when meeting up for gaming sessions, or perhaps which to take out to a game night.

Made mainly to practice and improve my own skills - particularly with React - but I hope it provides a useful service to gamers.

It is [available to use online](https://robinzigmond.github.io/which-game-to-play/) via Github pages.

And apologies for the appallingly bad meeple drawings, my graphical skills are probably worse than those of the average 10-year-old :-) (Feel free to submit a pull request if you want to replace the drawings with better ones - or indeed if you want to improve the project in some other way!)

---

## Brief Technical Details

The project was mainly made with [Create React App](https://github.com/facebook/create-react-app) - with some additions to add polyfills for IE11 and to enable easy deployment on Github pages. (The app is perfectly usable on IE11 but a couple of things don't behave quite as intended, as ever I would recommend using a modern browser wherever you can.)

It uses the Boardgamegeek XML API to fetch collection data - but rather than dealing with the XML directly I made a custom Python-based [backend](https://github.com/robinzigmond/wgtp-backend) to simplify this.
