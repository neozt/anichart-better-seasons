# anichart-better-seasons

Tempermonkey user script to change the way season links are rendered in [Anichart](https://anichart.net/). The currently selected season is made to always appear in the middle, with the previous two and next two seasons on the left and right of it for seamless browsing between seasons.

**How Anichart looks with this extension:**
![Screenshot of Anichart with extension enabled](docs/images/anichart-extension-enabled.png)
Notice the season links at the top. Currently Summer 2024 is selected.

**Original:**
![Screenshot of Anichart without extension enabled](docs/images/anichart-original.png)

## Features

1. Replace default season links to dynamically generated list centered around the currently selected season.
2. Adds keyboard shortcuts to go to previous or next season (<kbd>Ctrl + Left Arrow</kbd> and <kbd>Ctrl + Right Arrow</kbd> by default).

## How to customise

Customise the behaviour of this extension by modifying the `CONFIG` object at the top of the script.

## How to install

1. Install [Tempermonkey](https://www.tampermonkey.net/) extension in your browser if you don't already have it.
2. Add a new user script in Tempermonkey and replace the content of it with the content of `anichart-better-seasons.js` file and make sure it is enabled.
3. (Optional) [Enable dev mode](https://www.tampermonkey.net/faq.php?locale=en#Q209) to allow user scripts to work on Chromium browsers.
