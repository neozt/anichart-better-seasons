// ==UserScript==
// @name         anichart-better-seasons
// @namespace    https://github.com/neozt/anichart-better-seasons
// @version      v1.0.0
// @description  Replaces the season links at the top Anichart so that currently selected season is always centered
// @author       Zhen Ting, Neo
// @match        https://anichart.net/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anichart.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict'

    console.log('[anichart-better-seasons] script running')

    window.navigation.addEventListener("navigate", () => setTimeout(main))

    function main() {
        const currentUrl = getUrl(window)
        const currentSeason = extractSeason(currentUrl)

        console.log(`[anichart-better-seasons] currentSeason: ${JSON.stringify(currentSeason)}, currentUrl: ${currentUrl}`)

        const seasonsContainer = document.querySelector('.seasons')
        const seasonLinks = [-2, -1, 0, 1, 2]
            .map(i =>
                createSeasonLink(document, {
                    season: changeSeason(currentSeason, i),
                    dataAttr: extractVueDataAttr(seasonsContainer),
                    isActive: i === 0,
                })
            )
        seasonsContainer.replaceChildren(...seasonLinks)
    }

    /**
     * Returns the current browser URL.
     * @param {Window} window Browser window object
     * @returns {string}
     */
    function getUrl(window) {
        return window.location.href
    }

    /**
     * Extracts season's name and year from a URL.
     * @param {string} url
     * @returns {{name: string, year: number}}
     */
    function extractSeason(url) {
        const splitted = url.split('/')
        const lastPart = splitted[splitted.length - 1]
        const [name, year] = lastPart.split('-')
        return {name, year: parseInt(year)}
    }

    /**
     * Calculates the value of the next <code>offset</code> season.
     * @param {{name: string, year: number}} current The current season
     * @param {number} offset Can be positive or negative. Positive will calculate next season, negative will calculate previous season
     * @returns {{name: string, year: number}}
     */
    function changeSeason(current, offset) {
        const NAME_OF_SEASONS = ['Winter', 'Spring', 'Summer', 'Fall']
        const {name: currentSeasonName, year: currentYear} = current
        const currentSeasonIndex = NAME_OF_SEASONS.findIndex(name => name === currentSeasonName)

        const deltaYear = Math.floor((currentSeasonIndex + offset) / NAME_OF_SEASONS.length)

        const newName = NAME_OF_SEASONS[mod(currentSeasonIndex + offset, NAME_OF_SEASONS.length)]
        const newYear = currentYear + deltaYear

        return {name: newName, year: newYear}
    }

    /**
     *
     * @param {{name: string, year: number}} season
     * @returns {string} New relative url that points to <code>season</code>
     */
    function constructSeasonUrl(season) {
        return `/${season.name}-${season.year}`
    }


    /**
     *
     * @param {HTMLElement} node
     * @returns {undefined|string}
     */
    function extractVueDataAttr(node) {
        const rawDataAttr = Object.keys(node.dataset)?.[0]
        if (!rawDataAttr) {
            return undefined
        }

        return `${rawDataAttr[0]}-${rawDataAttr.substring(1)}`
    }

    /**
     *
     * @param {Document} document
     * @param {{name: string, year: number}} season
     * @param {string} dataAttr
     * @param {boolean} isActive
     * @returns {HTMLAnchorElement} Anchor tag used to redirect the browser to `season` page
     */
    function createSeasonLink(document, {season, dataAttr, isActive}) {
        const seasonNameDiv = document.createElement('div')
        seasonNameDiv.className = 'season-name'
        seasonNameDiv.innerText = season.name
        seasonNameDiv.setAttribute(`data-${dataAttr}`, undefined)

        const seasonYearDiv = document.createElement('div')
        seasonYearDiv.className = 'season-year'
        seasonYearDiv.innerText = season.year.toString()
        seasonYearDiv.setAttribute(`data-${dataAttr}`, undefined)

        const anchor = document.createElement('a')
        anchor.href = constructSeasonUrl(season)
        anchor.className = isActive ? 'season router-link-exact-active router-link-active' : 'season'
        anchor.setAttribute(`data-${dataAttr}`, undefined)
        anchor.append(seasonNameDiv, seasonYearDiv)
        return anchor
    }

    /**
     * Calculate a mod b. Caters for negative values as well, unlike Javascript's native % operator.
     * @param a
     * @param b
     * @returns {number}
     */
    function mod(a, b) {
        return ((a % b) + b) % b
    }
})()