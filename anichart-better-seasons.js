// ==UserScript==
// @name         anichart-better-seasons
// @namespace    https://github.com/neozt/anichart-better-seasons
// @version      v1.1.1
// @description  Replaces the season links at the top Anichart so that currently selected season is always centered
// @author       Zhen Ting, Neo
// @match        https://anichart.net/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=anichart.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict'

    /** Customize your config here **/
    const CONFIG = {
        replaceSeasonLinks: true, // set to false to use default Anichart season links
        previousSeasonKey: 'ArrowLeft', // set undefined to disable previous season shortcut
        previousSeasonKeyMod: 'ctrlKey', // undefined or 'ctrlKey' or 'altKey' or 'shiftKey'
        nextSeasonKey: 'ArrowRight', // set undefined to disable next season shortcut
        nextSeasonKeyMod: 'ctrlKey', // undefined or 'ctrlKey' or 'altKey' or 'shiftKey'
    }

    const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall']

    console.log('[anichart-better-seasons] script running')

    if (CONFIG.replaceSeasonLinks) {
        window.navigation.addEventListener("navigate", () => setTimeout(replaceSeasonLinks))
    }

    if (CONFIG.previousSeasonKey || CONFIG.nextSeasonKey) {
        document.addEventListener("keydown", handleKeyboardShortcuts)
    }

    /**
     * Replace Anichart's season link at the top with season links centered around currently selected season.
     */
    function replaceSeasonLinks() {
        const currentUrl = getUrl(window)
        const currentSeason = extractSeason(currentUrl)

        console.log(`[anichart-better-seasons] currentSeason: ${JSON.stringify(currentSeason)}, currentUrl: ${currentUrl}`)

        if (!currentSeason) {
            return
        }

        const seasonsContainer = document.querySelector('.seasons')
        const seasonLinks = [-2, -1, 0, 1, 2]
            .map(i =>
                createSeasonLink(document, {
                    season: incrementSeason(currentSeason, i),
                    dataAttr: extractVueDataAttr(seasonsContainer),
                    activeLink: i === 0,
                })
            )
        seasonsContainer.replaceChildren(...seasonLinks)
    }

    /**
     * Navigate to previous or next season when keyboard shortcut is pressed.
     * @param {KeyboardEvent} event
     */
    function handleKeyboardShortcuts(event) {
        // console.log("[anichart-better-seasons] event", event) // Uncomment this line to find out what value to set for previousSeasonKey or nextSeasonKey

        const currentUrl = getUrl(window)
        const currentSeason = extractSeason(currentUrl)

        if (!currentSeason) {
            return
        }

        if (event.key === CONFIG.previousSeasonKey && (CONFIG.previousSeasonKeyMod === undefined || event[CONFIG.previousSeasonKeyMod])) {
            const previousSeason = incrementSeason(currentSeason, -1)
            window.location.assign(constructSeasonUrl(previousSeason))
        } else if (event.key === CONFIG.nextSeasonKey && (CONFIG.nextSeasonKeyMod === undefined || event[CONFIG.nextSeasonKeyMod])) {
            const nextSeason = incrementSeason(currentSeason, 1)
            window.location.assign(constructSeasonUrl(nextSeason))
        }
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
     * @returns {{name: string, year: number} | undefined}
     */
    function extractSeason(url) {
        const splitted = url.split('/')
        const lastPart = splitted[splitted.length - 1]
        const [name, year] = lastPart.split('-')

        const yearNumber = parseInt(year)

        if (!SEASONS.includes(name) || isNaN(yearNumber)) {
            return undefined
        }

        return {name, year: yearNumber}
    }

    /**
     * Calculates the value of the next <code>offset</code> season.
     * @param {{name: string, year: number}} current The current season
     * @param {number} offset Can be positive or negative. Positive will calculate next season, negative will calculate previous season
     * @returns {{name: string, year: number}}
     */
    function incrementSeason(current, offset) {
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
     * @param {boolean} activeLink Whether the link is currently selected
     * @returns {HTMLAnchorElement} Anchor tag used to redirect the browser to `season` page
     */
    function createSeasonLink(document, {season, dataAttr, activeLink}) {
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
        anchor.className = activeLink ? 'season router-link-exact-active router-link-active' : 'season'
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