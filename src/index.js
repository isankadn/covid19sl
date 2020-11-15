import * as c3 from 'c3'
const tippy = require('tippy.js').default
    // mapboxgl.accessToken ='pk.eyJ1IjoiaXNhbmthZG4iLCJhIjoiY2s3dmIxYmxhMGJ2OTNmbzJnZjFxcmF6ZyJ9.Pgj6f8H7NpCRI1fNOK3MfA'
mapboxgl.accessToken = 'pk.eyJ1IjoiaXNhbmthZG4iLCJhIjoiY2s3eGI3ams2MDFsMTNmcjRsdnh4ZTNpOSJ9.C7esI-qqpgWXdPbZe04aOw'
const PREFECTURE_JSON_PATH = 'https://isankadn.github.io/static/prefectures.geojson'
const JSON_PATH = 'https://covid-19sl.s3-ap-northeast-1.amazonaws.com/data.json'
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_CONFIRMED = 'rgb(244,67,54, 0.3)'
const COLOR_ACTIVE = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(4,148,39, 0.7)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const COLOR_INCREASE = 'rgb(223,14,31, 1)'
const PAGE_TITLE = 'Coronavirus Disease (COVID-19) Sri Lanka Tracker'
let LANG = 'en'
    //https://docs.google.com/spreadsheets/d/e/2PACX-1vSCRHzTX82QIyeYRwyzEdLsQZN7uq8Zqf5D1lH5g99qBbOvyQQf0xJit4WvQe2xFyzee3UrmXEkZkLa/pub?output=csv
    // Global vars
const JSON_PATH_HPB = 'https://hpb.health.gov.lk/api/get-current-statistical'

let ddb = {
    prefectures: undefined,
    trend: undefined,
    totals: {
        confirmed: 0,
        recovered: 0,
        deceased: 0,
        tested: 0,
        critical: 0,


    },
    totalsDiff: {
        confirmed: 0,
        recovered: 0,
        deceased: 0,
        tested: 0,
        critical: 0
    }
}
let map = undefined


// IE11 forEach Polyfill
if ('NodeList' in window && !NodeList.prototype.forEach) {
    console.info('polyfill for IE11');
    NodeList.prototype.forEach = function(callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}



function loadData(callback) {
    // Load the json data file

    fetch(JSON_PATH)
        .then(function(res) {
            return res.json()
        })
        .then(function(data) {
            callback(data)
        })
}

function loadDataHpb(callback) {
    // Load the json data file

    fetch(JSON_PATH_HPB)
        .then(function(res) {
            return res.json()
        })
        .then(function(data) {
            callback(data)
        })
}


function calculateTotals(daily) {
    // Calculate the totals

    let totals = {
        confirmed: 0,
        recovered: 0,
        deceased: 0,
        critical: 0,
        tested: 0,

    }
    let totalsDiff = {
        confirmed: 1,
        recovered: 1,
        deceased: 1,
        critical: 1,
        tested: 1
    }

    // If there is an empty cell, fall back to the previous row
    function pullLatestSumAndDiff(key) {
        if (daily[daily.length - 1][key].length) {
            totals[key] = parseInt(daily[daily.length - 1][key])
            totalsDiff[key] = totals[key] - parseInt(daily[daily.length - 2][key])
        } else {
            totals[key] = parseInt(daily[daily.length - 2][key])
            totalsDiff[key] = totals[key] - parseInt(daily[daily.length - 3][key])
        }
    }

    pullLatestSumAndDiff('tested')
    pullLatestSumAndDiff('critical')
    pullLatestSumAndDiff('confirmed')
    pullLatestSumAndDiff('recovered')
    pullLatestSumAndDiff('deceased')

    return [totals, totalsDiff]
}


function drawMap() {
    // Initialize Map

    map = new mapboxgl.Map({
        container: 'map-container',
        style: 'mapbox://styles/mapbox/light-v10',
        zoom: 2,
        minZoom: 1,
        maxZoom: 9,
        center: {
            lng: 7.294545,
            lat: 80.6082719
        },
        maxBounds: [
            { lat: 2.066655, lng: 76.242261 }, // SW
            { lat: 13.323069, lng: 84.130887 } // NE
        ]
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.scrollZoom.disable()
    map.addControl(new mapboxgl.NavigationControl({
        showCompass: false,
        showZoom: true
    }))
}

if (mchart) { mchart.destroy() }
if (mchart2) {
    mchart2.destroy()
}
var mchart
var mchart2

function drawTrendChart(sheetTrend) {


    let lastUpdated = ''
    let labelSet = []
    let confirmedSet = []
    let recoveredSet = []
    let deceasedSet = []
    let dailyIncreaseSet = []
    let dailyRecoveredSet = []
    let activeSet = []

    let prevRecoveredSet = -1
    let prevConfirmed = -1
    sheetTrend.map(function(trendData) {
            //  console.log(trendData.date)
            labelSet.push(new Date(trendData.date))
            confirmedSet.push({
                x: new Date(trendData.date),
                y: parseInt(trendData.confirmed)
            })
            recoveredSet.push({
                x: new Date(trendData.date),
                y: parseInt(trendData.recovered)
            })
            deceasedSet.push({
                x: new Date(trendData.date),
                y: parseInt(trendData.deceased)
            })
            dailyIncreaseSet.push({
                x: new Date(trendData.date),
                y: prevConfirmed === -1 ? 0 : parseInt(trendData.confirmed) - prevConfirmed
            })
            dailyRecoveredSet.push({
                x: new Date(trendData.date),
                y: prevRecoveredSet === -1 ? 0 : parseInt(trendData.recovered) - prevRecoveredSet
            })
            if (trendData.confirmed != '') {
                activeSet.push({

                    x: new Date(trendData.date),
                    y: parseInt(trendData.confirmed - trendData.recovered - trendData.deceased),
                })
            }
            prevRecoveredSet = parseInt(trendData.recovered)
            prevConfirmed = parseInt(trendData.confirmed)
            lastUpdated = trendData.date
        })
        // console.log(deceasedSet.slice(1))
        // console.log("asasazs")
        // console.log(recoveredSet.slice(1))


    var ctx = document.getElementById('trend-chart').getContext('2d')
    Chart.defaults.global.defaultFontFamily = "'Open Sans', helvetica, sans-serif"
    Chart.defaults.global.defaultFontSize = 12
    Chart.defaults.global.defaultFontColor = 'rgb(0,10,18)'
        //   console.log(this)
    mchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labelSet.slice(1),
            datasets: [{
                    label: 'Deceased',
                    borderColor: COLOR_DECEASED,
                    backgroundColor: COLOR_DECEASED,
                    fill: false,
                    data: deceasedSet.slice(1),
                    pointRadius: 2,
                },
                {
                    label: 'Recovered',
                    borderColor: COLOR_RECOVERED,
                    backgroundColor: COLOR_RECOVERED,
                    fill: false,
                    data: recoveredSet.slice(1),
                    pointRadius: 2,
                },
                {
                    label: 'Confirmed',
                    borderColor: COLOR_CONFIRMED,
                    backgroundColor: COLOR_CONFIRMED,
                    fill: false,
                    data: confirmedSet.slice(1),
                    pointRadius: 2,
                },
                {
                    label: 'Active',
                    borderColor: COLOR_ACTIVE,
                    backgroundColor: COLOR_ACTIVE,
                    fill: false,
                    data: activeSet.slice(1),
                    pointRadius: 2,
                },

            ],
        },
        options: {
            events: ['click'],
            hover: {
                mode: 'point',
            },
            tooltips: {
                mode: 'index',
                position: 'nearest',
                titleFontSize: 9,
                bodyFontSize: 9,
            },
            maintainAspectRatio: true,
            responsive: true,
            elements: {
                line: {
                    tension: 0.1,
                },
            },
            legend: {
                display: false,
                reverse: true,
                fullWidth: true,
            },
            scales: {
                xAxes: [{
                        display: false,
                        type: 'time',
                        time: {
                            parser: TIME_FORMAT,
                            round: 'day',
                            tooltipFormat: 'll',
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Date',
                        },
                    },
                    {
                        ticks: {
                            fontSize: 8,
                            minRotation: 90,
                            maxRotation: 90,
                            callback: function(value, index, values) {
                                return new moment(value).format('DD MM')
                            },
                        },
                    },
                ],
                yAxes: [{
                    ticks: {
                        minor: {
                            fontSize: 8,
                        },
                    },
                    scaleLabel: {
                        fontSize: 8,
                        display: false,
                        labelString: 'Cases',
                    },
                }, ],
            },
        },
    })
    mchart.update()


    var ctx2 = document.getElementById('trend-chart-daily-increase').getContext('2d')



    mchart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labelSet.slice(1),
            datasets: [{
                    label: 'Daily Increase',
                    borderWidth: 1,
                    borderColor: 'rgb(223,14,31, 1)',
                    backgroundColor: 'rgb(223,14,31, 0.7)',
                    fill: false,
                    data: dailyIncreaseSet.slice(1),
                },
                {
                    label: 'Daily Recovered',
                    borderWidth: 1,
                    borderColor: 'rgb(4,148,39, 1)',
                    backgroundColor: 'rgb(4,148,39, 0.7)',
                    fill: true,
                    data: dailyRecoveredSet.slice(1),
                },
            ],
        },
        options: {
            events: ['click'],
            hover: {
                mode: 'point',
            },
            tooltips: {
                mode: 'index',
                position: 'nearest',
                titleFontSize: 9,
                bodyFontSize: 9,
            },
            maintainAspectRatio: true,
            responsive: true,
            elements: {
                line: {
                    tension: 0.1,
                },
            },
            legend: {
                display: true,
                reverse: true,
                fullWidth: true,
                align: 'center',
                labels: {
                    fontSize: 10,
                },
            },
            scales: {
                xAxes: [{
                        offset: false,
                        stacked: true,
                        type: 'time',
                        display: false,
                        time: {
                            unit: 'day',
                            parser: TIME_FORMAT,
                            round: 'day',
                            tooltipFormat: 'll',
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Date',
                        },
                    },

                    {
                        gridLines: {
                            offsetGridLines: false,
                            display: true,
                        },
                        ticks: {
                            beginAtZero: true,
                            fontSize: 8,
                            minRotation: 90,
                            maxRotation: 90,
                            callback: function(value, index, values) {
                                return new moment(value).format('DD MM')
                            },
                        },
                    },
                ],

                yAxes: [{
                    gridLines: {
                        offsetGridLines: false,
                    },
                    ticks: {
                        minor: {
                            fontSize: 8,
                        },
                    },

                    scaleLabel: {
                        fontSize: 8,
                        display: false,
                        labelString: 'Cases',
                    },
                }, ],
            },

            animation: {
                duration: 1,
                onComplete: function() {
                    var chartInstance = this.chart

                    ctx = chartInstance.ctx
                    this.chart.options.scales.yAxes[0].ticks.minor.fontSize = Math.round(
                        this.chart.width / 64
                    )

                    ctx.font = Chart.helpers.fontString(
                        Math.round(this.chart.width / 64),
                        Chart.defaults.global.defaultFontStyle,
                        Chart.defaults.global.defaultFontFamily
                    )

                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'bottom'

                    this.data.datasets.forEach(function(dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i)

                        meta.data.forEach(function(bar, index) {
                            if (dataset.data[index].y > 0) {
                                var data = dataset.data[index].y

                                ctx.fillText(data, bar._model.x, bar._model.y)
                            }
                        })
                    })
                },
            },
        },
    })

}


function drawPrefectureTable(prefectures, totals) {
    // Draw the Cases By Prefecture table

    let dataTable = document.querySelector('#prefectures-table tbody')
    let unspecifiedRow = ''

    // Remove the loading cell
    dataTable.innerHTML = ''

    // Parse values so we can sort
    _.map(prefectures, function(pref) {
        //   console.log(pref.recovered)
        // TODO change to confirmed
        pref.confirmed = (pref.cases ? parseInt(pref.cases) : 0)
        pref.recovered = (pref.recovered ? parseInt(pref.recovered) : 0)
            // TODO change to deceased
        pref.deceased = (pref.deaths ? parseInt(pref.deaths) : 0)
    })

    // Iterate through and render table rows
    _.orderBy(prefectures, 'confirmed', 'desc').map(function(pref) {
        if (!pref.confirmed && !pref.recovered && !pref.deceased) {
            return
        }

        let prefStr


        if (LANG == 'en') {
            prefStr = pref.prefecture
        } else if (LANG == 'si') {
            prefStr = pref.prefecturesi
        } else if (LANG == 'ta') {
            prefStr = pref.prefectureta
        }
        // TODO Make this pretty

        if (pref.prefecture == 'Unspecified') {
            // Save the "Unspecified" row for the end of the table
            unspecifiedRow = "<tr><td><em>" + prefStr + "</em></td><td>" + pref.confirmed + "</td><td>" + pref.recovered + "</td><td>" + pref.deaths + "</td></tr>"
        } else if (pref.prefecture == 'Total') {
            // Skip
        } else {
            dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + prefStr + "</td><td>" + pref.confirmed + "</td><td>" + pref.recovered + "</td><td>" + (pref.deceased ? pref.deceased : 0) + "</td></tr>"
        }
        return true
    })

    dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow

    let totalStr
    if (LANG == 'en') {
        totalStr = 'Total'
    } else if (LANG == 'si') {
        totalStr = 'එකතුව'
    } else if (LANG == 'ta') {
        totalStr = 'மொத்தம்'
    }

    dataTable.innerHTML = dataTable.innerHTML + "<tr class='totals'><td>" + totalStr + "</td><td>" + totals.confirmed + "</td><td>" + totals.recovered + "</td><td>" + totals.deceased + "</td></tr>"
}


function drawHositalTable(data) {
    // Draw the Cases By Prefecture table
    // console.log(data)
    let dataTable = document.querySelector('#hospital-table tbody')
    let unspecifiedRow = ''

    // Remove the loading cell

    dataTable.innerHTML = ''



    //   console.log(treatment_total)

    _.map(data, function(d) {
        //   console.log(d)
        // TODO change to confirmed
        d.hospitalname = d.hospital.name
        d.hospitalnamesi = d.hospital.name_si
        d.hospitalnameta = d.hospital.name_ta
        d.testedtotal = d.cumulative_total
        d.treatmenttotal = d.treatment_total
            // TODO change to deceased
            //    d.deceased = d.deaths ? parseInt(d.deaths) : 0

    })

    _.orderBy(data, 'testedtotal', 'desc').map(function(d) {
        if (!d.hospitalname && !d.testedtotal && !d.treatmenttotal) {
            return
        }

        dataTable.innerHTML = dataTable.innerHTML + '<tr><td  data-en="' + d.hospitalname + '" data-si="' + d.hospitalnamesi + '" data-ta="' + d.hospitalnameta + '" class="hospitalname">' + d.hospitalname + '</td><td>' + d.testedtotal + '</td><td>' + d.treatmenttotal + '</td></tr>'
    })



}


function drawKpis(
    totals,
    totalsDiff,
    local_total_cases,
    local_deaths,
    local_recovered,
    local_active_cases,
    local_new_cases,
    local_new_deaths,
    total_pcr_testing_count
) {
    // Draw the KPI values

    function setKpi(key, value) {
        document.querySelector('#kpi-' + key + ' .value').innerHTML = value
    }

    function setKpiDiff(key, value) {
        let diffDir = value >= 0 ? '+' : ''
        document.querySelector('#kpi-' + key + ' .diff').innerHTML =
            '( ' + diffDir + value + ' )'
    }
    var highestConfirmed =
        local_total_cases > totals.confirmed ?
        local_total_cases :
        totals.confirmed
    console.log(totals.confirmed)
    setKpi('confirmed', highestConfirmed)
    var highestDiffConfirmed =
        local_new_cases > totalsDiff.confirmed ?
        local_new_cases :
        totalsDiff.confirmed
    setKpiDiff('confirmed', highestDiffConfirmed)

    var highestRecovered =
        local_recovered > totals.recovered ? local_recovered : totals.recovered
    setKpi('recovered', highestRecovered)
    setKpiDiff('recovered', totalsDiff.recovered)

    var highestDeceased =
        local_deaths > totals.deceased ? local_deaths : totals.deceased
    setKpi('deceased', highestDeceased)
    var highestDiffDeceased =
        local_new_deaths > totalsDiff.deceased ?
        local_new_deaths :
        totalsDiff.deceased
    setKpiDiff('deceased', highestDiffDeceased)

    setKpi('critical', totals.critical)
    setKpiDiff('critical', totalsDiff.critical)

    var highestTested =
        total_pcr_testing_count > totals.tested ?
        total_pcr_testing_count :
        totals.tested
    setKpi('tested', highestTested)
    setKpiDiff('tested', totalsDiff.tested)
    var activeCases = totals.confirmed - totals.recovered - totals.deceased
    var highesactiveCases =
        local_active_cases > activeCases ? local_active_cases : activeCases
    setKpi('active', highesactiveCases)
    setKpiDiff(
        'active',
        totalsDiff.confirmed - totalsDiff.recovered - totalsDiff.deceased
    )
    setKpi(
        'deceasedpercentage',
        ((totals.deceased * 100) / totals.confirmed).toFixed(2)
    )
}

function drawTotalHospitalized(totalhospitalized) {
    // console.log('jsonData')

    function setKpi(key, value) {

        document.querySelector('#kpi-tested' + ' .hositalized').innerHTML = value

    }

    setKpi('hospitalized', '&nbsp (' + totalhospitalized + ')')

}


function drawLastUpdated(lastUpdated) {
    // Draw the last updated time

    // TODO we should be parsing the date, but I
    // don't trust the user input on the sheet
    //let prettyUpdatedTime = moment(lastUpdated).format('MMM D, YYYY') + ' JST'
    document.getElementById('last-updated').innerHTML = lastUpdated
}


function drawPageTitleCount(confirmed) {
    // Update the number of confirmed cases in the title

    document.title = "(" + confirmed + ") " + PAGE_TITLE
}

/**
 * drawMapPrefectures
 * @param {*} pageDraws - number of redraws to screen
 */
function drawMapPrefectures(pageDraws) {
    // Find the index of the first symbol layer
    // in the map style so we can draw the
    // prefecture colors behind it

    var firstSymbolId
    var layers = map.getStyle().layers
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id
            break;
        }
    }

    // Start the Mapbox search expression
    let prefecturePaint = ['match', ['get', 'NAME_1']]

    // Go through all prefectures looking for cases
    ddb.prefectures.map(function(prefecture) {

        let cases = parseInt(prefecture.cases)
        if (cases > 0) {
            prefecturePaint.push(prefecture.prefecture)

            if (cases <= 10) {
                // 1-10 cases
                prefecturePaint.push('rgb(253,234,203)')
            } else if (cases <= 25) {
                // 11-25 cases
                prefecturePaint.push('rgb(251,155,127)')
            } else if (cases <= 50) {
                // 26-50 cases
                prefecturePaint.push('rgb(244,67,54)')
            } else {
                // 51+ cases
                prefecturePaint.push('rgb(186,0,13)')
            }
        }

    })

    // Add a final value to the list for the default color
    prefecturePaint.push('rgba(0,0,0,0)')


    if (pageDraws === 0) {
        // If it is the first time drawing the map

        map.addSource('prefectures', {
            type: 'geojson',
            data: PREFECTURE_JSON_PATH,
        })

        // Add the prefecture color layer to the map
        map.addLayer({
            'id': 'prefecture-layer',
            'type': 'fill',
            'source': 'prefectures',
            'layout': {},
            'paint': {
                'fill-color': prefecturePaint,
                'fill-opacity': 0.8
            }
        }, firstSymbolId)

        // Add another layer with type "line"
        // to provide a styled prefecture border
        let prefBorderLayer = map.addLayer({
            'id': 'prefecture-outline-layer',
            'type': 'line',
            'source': 'prefectures',
            'layout': {},
            'paint': {
                'line-width': 0.5,
                'line-color': '#c0c0c0',
                'line-opacity': 0.5
            }
        }, firstSymbolId)

    } else {
        // Update prefecture paint properties

        map.setPaintProperty('prefecture-layer', 'fill-color', prefecturePaint)

    }
}

function initDataTranslate() {
    // Handle language switching using data params

    const selector = '[data-si]'
    const parseNode = function(cb) {
        document.querySelectorAll(selector).forEach(cb)
    }

    // Default website is in English. Extract it as the attr data-en="..."
    parseNode(function(el) {
        el.dataset['en'] = el.textContent
    })

    // Language selector event handler
    document.querySelectorAll('[data-lang-picker]').forEach(function(pick) {

        pick.addEventListener('click', function(e) {

            e.preventDefault()

            LANG = e.target.dataset.langPicker

            // Toggle the html lang tags
            parseNode(function(el) {
                if (!el.dataset[LANG]) return;
                el.textContent = el.dataset[LANG]
            })

            // Update the map
            map.getStyle().layers.forEach(function(thisLayer) {

                if (thisLayer.type == 'symbol') {
                    // console.log(LANG)
                    map.setLayoutProperty(thisLayer.id, 'text-field', ['get', 'name_' + LANG])
                        //    console.log(thisLayer.id)
                }
            })

            // Redraw the prefectures table
            if (document.getElementById('prefectures-table')) {
                drawPrefectureTable(ddb.prefectures, ddb.totals)
            }
            // Redraw the hospital table


            // Toggle the lang picker
            document.querySelectorAll('a[data-lang-picker]').forEach(function(el) {
                    el.style.display = 'inline'
                })
                //   document.querySelector('a[data-lang-picker='+LANG+']').style.display = 'none'

        })
    })
}

window.onload = function() {

    if (tippy) {
        tippy('[data-tippy-content]')
    }

    initDataTranslate()


    var pageDraws = 0
    var styleLoaded = false
    var jsonData = undefined

    var jsonHpbData = undefined
    const FIVE_MINUTES_IN_MS = 300000

    function whenMapAndDataReady() {
        // This runs drawMapPref only when
        // both style and json data are ready

        if (!styleLoaded || !jsonData) {
            return
        }

        drawMapPrefectures(pageDraws)
    }

    function LoadHpbDataOnPage() {
        loadDataHpb(function(data) {
            jsonHpbData = data

            // console.log(jsonHpbData['data'])



            hospitalData = jsonHpbData['data']['hospital_data']
            drawHositalTable(hospitalData)

            treatment_total =
                jsonHpbData['data'][
                    'local_total_number_of_individuals_in_hospitals'
                ]
            if (!document.body.classList.contains('embed-mode')) {
                drawTotalHospitalized(treatment_total)
            }

        })

    }


    function loadDataOnPage() {

        loadData(function(data) {
            jsonData = data

            ddb.prefectures = jsonData.prefectures
            let newTotals = calculateTotals(jsonData.daily)
            ddb.totals = newTotals[0]
            ddb.totalsDiff = newTotals[1]
            ddb.trend = jsonData.daily
            ddb.lastUpdated = jsonData.updated[0].lastupdated

            drawKpis(
                ddb.totals,
                ddb.totalsDiff,

            )

            loadDataHpb(function(data) {
                jsonHpbData = data

                let local_total_cases = jsonHpbData['data']['local_total_cases']
                let local_deaths = jsonHpbData['data']['local_deaths']
                let local_recovered = jsonHpbData['data']['local_recovered']
                let local_active_cases = jsonHpbData['data']['local_active_cases']
                let local_new_cases = jsonHpbData['data']['local_new_cases']
                let local_new_deaths = jsonHpbData['data']['local_new_deaths']
                let total_pcr_testing_count = jsonHpbData['data']['total_pcr_testing_count']

                // console.log(jsonHpbData['data'])

                drawKpis(
                    ddb.totals,
                    ddb.totalsDiff,
                    local_total_cases,
                    local_deaths,
                    local_recovered,
                    local_active_cases,
                    local_new_cases,
                    local_new_deaths,
                    total_pcr_testing_count
                )
            })


            if (!document.body.classList.contains('embed-mode')) {
                drawLastUpdated(ddb.lastUpdated)
                drawPageTitleCount(ddb.totals.confirmed)
                drawPrefectureTable(ddb.prefectures, ddb.totals)
                drawTrendChart(ddb.trend)
            }

            whenMapAndDataReady()
        })
    }


    LoadHpbDataOnPage()
    loadDataOnPage()
    drawMap()
    map.once('style.load', function(e) {
        styleLoaded = true
        whenMapAndDataReady()
    })

}
const FIVE_MINUTES_IN_MS = 30000000
    // Reload data every INTERVAL
setInterval(function() {

    loadData(function(data) {
        jsonData = data

        ddb.prefectures = jsonData.prefectures
        let newTotals = calculateTotals(jsonData.daily)
        ddb.totals = newTotals[0]
        ddb.totalsDiff = newTotals[1]
        ddb.trend = jsonData.daily
        ddb.lastUpdated = jsonData.updated[0].lastupdated

        drawKpis(ddb.totals, ddb.totalsDiff)
        if (!document.body.classList.contains('embed-mode')) {
            drawLastUpdated(ddb.lastUpdated)
            drawPageTitleCount(ddb.totals.confirmed)
            drawPrefectureTable(ddb.prefectures, ddb.totals)
            drawTrendChart(ddb.trend)
        }


    })

}, FIVE_MINUTES_IN_MS)

var el = document.getElementById('range-start')
if (el) {
    el.addEventListener('change', function() {
        // console.log(event.target)
        const range_start = document.getElementById('range-start').value
        const range_end = document.getElementById('range-end').value

        loadData(function(data) {
            jsonData = data
                //  console.log(jsonData)
                // console.log(new Date(range_start), new Date(range_end))
                // console.log(range_start, range_end)
            let newJsonData = []
            var tmpJsonData = jsonData.daily.filter(function(s) {
                    if (
                        new Date(s.date) >= new Date(range_start) &&
                        new Date(s.date) <= new Date(range_end)
                    ) {
                        newJsonData.push(s)
                            // console.log(s)
                    }
                })
                // console.log(newJsonData)
                // console.log('break....')

            ddb.trend = newJsonData

            drawKpis(ddb.totals, ddb.totalsDiff)
            if (!document.body.classList.contains('embed-mode')) {
                drawTrendChart(ddb.trend)
            }
        })
    })
}

var mapb = L.map('map', {
    center: [8.0324, 80.6267],
    minZoom: 8,
    zoom: 8,
})

L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}&b=1', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',

        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiaXNhbmthZG4iLCJhIjoiY2s3eGI3ams2MDFsMTNmcjRsdnh4ZTNpOSJ9.C7esI-qqpgWXdPbZe04aOw',
        type: 'vector',
    }
).addTo(mapb)

var myURL = jQuery('script[src$="index.js"]')
    .attr('src')
    .replace('index.js', '')

var myIcon = L.icon({
    iconUrl: myURL + 'static/maps/images/pin24.png',
    iconRetinaUrl: myURL + 'static/maps/images/pin48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14],
})

for (var i = 0; i < markers.length; ++i) {
    L.marker([markers[i].lat, markers[i].lng], { icon: myIcon })
        .bindPopup(
            '<a href="' +
            markers[i].url +
            '" target="_blank">' +
            markers[i].name +
            '</a>'
        )
        .addTo(mapb)
}


// deaths.html related JS

function deathSummary() {
    function setDeathValues(key, value) {
        document.querySelector('#death-' + key + ' .value').innerHTML = value
    }
    setDeathValues('total', 35)
}