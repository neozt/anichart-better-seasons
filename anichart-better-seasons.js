// ==UserScript==
// @name         anichart-better-seasons
// @namespace    https://github.com/neozt/anichart-better-seasons
// @version      v0.0.1
// @description  Replaces the season links at the top Anichart so that currently selected season is always centered
// @author       Zhen Ting, Neo
// @match        https://anichart.net/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anichart.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('[anichart-better-seasons] script running');

    window.navigation.addEventListener("navigate", () => setTimeout(main))

    function main() {
        const currentUrl = getUrl(window)
        const currentSeason = extractSeason(currentUrl)

        console.log("[anichart-better-seasons]", {currentSeason, currentUrl});

        const seasonsContainer = document.querySelector('.seasons')
        const seasonLinks = [-2, -1, 0, 1, 2]
            .map(i => createSeasonLink(document, changeSeason(currentSeason, i), getVueDataAttr(seasonsContainer), i === 0))
        seasonsContainer.replaceChildren(...seasonLinks)
    }

    /**
     * Returns the current URL.
     * @param {Window} window Browser window object
     * @returns {string}
     */
    function getUrl(window) {
        return window.location.href;
    }

    /**
     * Extracts season's name and year from a URL.
     * @param {string} url
     * @returns {{name: string, year: string}}
     */
    function extractSeason(url) {
        const splitted = url.split('/')
        const lastPart = splitted[splitted.length - 1];
        const [name, year] = lastPart.split('-')
        return {name, year}
    }

    /**
     * Calculates the value of the next <code>offset</code> season
     * @param {{name: string, year: string}} current The current season
     * @param {number} offset Can be positive or negative. Positive will calculate next season, negative will calculate previous season
     * @returns {{name: string, year: string}}
     */
    function changeSeason(current, offset) {
        const NAME_OF_SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];
        const {name: currentSeasonName, year: currentYear} = current;
        const currentSeasonIndex = NAME_OF_SEASONS.findIndex(name => name === currentSeasonName);

        let deltaYear = Math.floor((currentSeasonIndex + offset) / NAME_OF_SEASONS.length)

        const newName = NAME_OF_SEASONS[mod(currentSeasonIndex + offset, NAME_OF_SEASONS.length)]
        const newYear = (parseInt(currentYear) + deltaYear).toString()

        return {name: newName, year: newYear};
    }

    /**
     *
     * @param {{name: string, year: string}} season
     * @returns {string} New url that points to <code>season</code>
     */
    function constructSeasonUrl(season) {
        return `/${season.name}-${season.year}`;
    }


    /**
     *
     * @param {HTMLElement} node
     * @returns {undefined|string}
     */
    function getVueDataAttr(node) {
        const rawDataAttr = Object.keys(node.dataset)?.[0]
        if (!rawDataAttr) {
            return undefined;
        }

        return `${rawDataAttr[0]}-${rawDataAttr.substring(1)}`
    }

    /**
     * @param {Document} document
     * @param {{name: string, year: string}} season
     * @param {string} dataAttr
     * @param {boolean} isActive
     * @returns {HTMLAnchorElement}
     */
    function createSeasonLink(document, season, dataAttr, isActive) {
        const seasonNameDiv = document.createElement('div')
        seasonNameDiv.className = 'season-name'
        seasonNameDiv.innerText = season.name
        seasonNameDiv.setAttribute(`data-${dataAttr}`, undefined)

        const seasonYearDiv = document.createElement('div')
        seasonYearDiv.className = 'season-year'
        seasonYearDiv.innerText = season.year
        seasonYearDiv.setAttribute(`data-${dataAttr}`, undefined)

        const anchor = document.createElement('a')
        anchor.href = constructSeasonUrl(season)
        anchor.className = isActive ? 'season router-link-exact-active router-link-active' : 'season';
        anchor.setAttribute(`data-${dataAttr}`, undefined)
        anchor.append(seasonNameDiv, seasonYearDiv)
        return anchor;
    }

    /**
     * Calculate a mod b. Caters for negative values as well, unlike Javascript's native % operator.
     * @param a
     * @param b
     * @returns {number}
     */
    function mod(a, b) {
        return ((a % b) + b) % b;
    }
})();