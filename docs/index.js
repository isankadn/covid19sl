/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

mapboxgl.accessToken =
    'pk.eyJ1IjoiaXNhbmthZG4iLCJhIjoiY2s3dmIxYmxhMGJ2OTNmbzJnZjFxcmF6ZyJ9.Pgj6f8H7NpCRI1fNOK3MfA'
const PREFECTURE_JSON_PATH = 'static/prefectures.geojson'
const JSON_PATH = 'https://covid-19sl.s3-ap-northeast-1.amazonaws.com/data.json'
const TIME_FORMAT = 'YYYY-MM-DD'
const COLOR_CONFIRMED = 'rgb(244,67,54)'
const COLOR_RECOVERED = 'rgb(25,118,210)'
const COLOR_DECEASED = 'rgb(55,71,79)'
const COLOR_INCREASE = 'rgb(163,172,191)'
const PAGE_TITLE = 'Coronavirus Disease (COVID-19) Sri Lanka Tracker'
let LANG = 'en'
//https://docs.google.com/spreadsheets/d/e/2PACX-1vSCRHzTX82QIyeYRwyzEdLsQZN7uq8Zqf5D1lH5g99qBbOvyQQf0xJit4WvQe2xFyzee3UrmXEkZkLa/pub?output=csv
// Global vars
let ddb = {
  prefectures: undefined,
  trend: undefined,
  totals: {
    confirmed: 0,
    recovered: 0,
    deceased: 0,
    tested: 0,
    critical: 0
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
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}



function loadData(callback) {
  // Load the json data file

  fetch(JSON_PATH)
  .then(function(res){
    return res.json()
  })
  .then(function(data){
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
    tested: 0
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
    if(daily[daily.length-1][key].length){
      totals[key] = parseInt(daily[daily.length-1][key])
      totalsDiff[key] = totals[key] - parseInt(daily[daily.length-2][key])
    }else{
      totals[key] = parseInt(daily[daily.length-2][key])
      totalsDiff[key] = totals[key] - parseInt(daily[daily.length-3][key])
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
      minZoom: 0.5,
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


function drawTrendChart(sheetTrend) {

  let lastUpdated = ''
  let labelSet = []
  let confirmedSet = []
  let recoveredSet = []
  let deceasedSet = []
  let dailyIncreaseSet = []

  let prevConfirmed = -1
  sheetTrend.map(function(trendData){
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

    prevConfirmed = parseInt(trendData.confirmed)
    lastUpdated = trendData.date
  })

  var ctx = document.getElementById('trend-chart').getContext('2d')
  Chart.defaults.global.defaultFontFamily = "'Open Sans', helvetica, sans-serif"
  Chart.defaults.global.defaultFontSize = 16
  Chart.defaults.global.defaultFontColor = 'rgb(0,10,18)'

  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelSet,
      datasets: [
        {
          label: 'Deceased',
          borderColor: COLOR_DECEASED,
          backgroundColor: COLOR_DECEASED,
          fill: false,
          data: deceasedSet
        },
        {
          label: 'Recovered',
          borderColor: COLOR_RECOVERED,
          backgroundColor: COLOR_RECOVERED,
          fill: false,
          data: recoveredSet
        },
        {
          label: 'Confirmed',
          borderColor: COLOR_CONFIRMED,
          backgroundColor: COLOR_CONFIRMED,
          fill: false,
          data: confirmedSet
        },
        {
          label: 'Daily Increase',
          borderColor: COLOR_INCREASE,
          backgroundColor: COLOR_INCREASE,
          fill: false,
          data: dailyIncreaseSet
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      elements: {
        line: {
          tension: 0.1
        }
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            parser: TIME_FORMAT,
            round: 'day',
            tooltipFormat: 'll'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Cases'
          }
        }]
      }
    }
  });
}


function drawPrefectureTable(prefectures, totals) {
  // Draw the Cases By Prefecture table

  let dataTable = document.querySelector('#prefectures-table tbody')
  let unspecifiedRow = ''

  // Remove the loading cell
  dataTable.innerHTML = ''

  // Parse values so we can sort
  _.map(prefectures, function(pref){
    // TODO change to confirmed
    pref.confirmed = (pref.cases?parseInt(pref.cases):0)
    pref.recovered = (pref.recovered?parseInt(pref.recovered):0)
    // TODO change to deceased
    pref.deceased = (pref.deaths?parseInt(pref.deaths):0)
  })

  // Iterate through and render table rows
  _.orderBy(prefectures, 'confirmed', 'desc').map(function(pref){
    if(!pref.confirmed && !pref.recovered && !pref.deceased){
      return
    }

    let prefStr
    if(LANG == 'en'){
        prefStr = pref.prefecture
    }else{
      prefStr = pref.prefectureja
    }

    // TODO Make this pretty

    if(pref.prefecture == 'Unspecified'){
      // Save the "Unspecified" row for the end of the table
      unspecifiedRow = "<tr><td><em>" + prefStr + "</em></td><td>" + pref.confirmed + "</td><td>" + pref.recovered + "</td><td>" + pref.deaths + "</td></tr>"
    }else if (pref.prefecture == 'Total'){
      // Skip
    }else{
      dataTable.innerHTML = dataTable.innerHTML + "<tr><td>" + prefStr + "</td><td>" + pref.confirmed + "</td><td></td><td>" + (pref.deceased?pref.deceased:'') + "</td></tr>"
    }
    return true
  })

  dataTable.innerHTML = dataTable.innerHTML + unspecifiedRow

  let totalStr = 'Total'
  if(LANG == 'ja'){
    totalStr = '計'
  }

  dataTable.innerHTML = dataTable.innerHTML + "<tr class='totals'><td>" + totalStr + "</td><td>" + totals.confirmed + "</td><td>" + totals.recovered + "</td><td>" + totals.deceased + "</td></tr>"
}


function drawKpis(totals, totalsDiff) {
  // Draw the KPI values

  function setKpi(key, value) {
    document.querySelector('#kpi-' + key + ' .value').innerHTML = value
  }
  function setKpiDiff(key, value) {
    let diffDir = (value >= 0?'+':'')
    document.querySelector('#kpi-' + key + ' .diff').innerHTML = '( ' + diffDir + value + ' )'
  }

  setKpi('confirmed', totals.confirmed)
  setKpiDiff('confirmed', totalsDiff.confirmed)
  setKpi('recovered', totals.recovered)
  setKpiDiff('recovered', totalsDiff.recovered)
  setKpi('deceased', totals.deceased)
  setKpiDiff('deceased', totalsDiff.deceased)
  setKpi('critical', totals.critical)
  setKpiDiff('critical', totalsDiff.critical)
  setKpi('tested', totals.tested)
  setKpiDiff('tested', totalsDiff.tested)
  setKpi('active', (totals.confirmed - totals.recovered) - totals.deceased)
  setKpiDiff('active', (totalsDiff.confirmed - totalsDiff.recovered) - totalsDiff.deceased)

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
  for(var i = 0; i < layers.length; i++) {
    if(layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id
      break;
    }
  }

  // Start the Mapbox search expression
  let prefecturePaint = [
    'match',
    ['get', 'NAME_1'],
  ]

  // Go through all prefectures looking for cases
  ddb.prefectures.map(function(prefecture){

    let cases = parseInt(prefecture.cases)
    if(cases > 0){
      prefecturePaint.push(prefecture.prefecture)

      if(cases <= 10){
        // 1-10 cases
        prefecturePaint.push('rgb(253,234,203)')
      }else if(cases <= 25){
        // 11-25 cases
        prefecturePaint.push('rgb(251,155,127)')
      }else if(cases <= 50){
        // 26-50 cases
        prefecturePaint.push('rgb(244,67,54)')
      }else{
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

  const selector = '[data-ja]'
  const parseNode = function(cb) {
    document.querySelectorAll(selector).forEach(cb)
  }

  // Default website is in English. Extract it as the attr data-en="..."
  parseNode(function(el) {
    el.dataset['en'] = el.textContent
  })

  // Language selector event handler
  document.querySelectorAll('[data-lang-picker]').forEach(function(pick) {
    pick.addEventListener('click', function(e){
      e.preventDefault()
      LANG = e.target.dataset.langPicker

      // Toggle the html lang tags
      parseNode(function(el) {
        if (!el.dataset[LANG]) return;
        el.textContent = el.dataset[LANG]
      })

      // Update the map
      map.getStyle().layers.forEach(function(thisLayer){
        if(thisLayer.type == 'symbol'){
          map.setLayoutProperty(thisLayer.id, 'text-field', ['get','name_' + LANG])
        }
      })

      // Redraw the prefectures table
      if(document.getElementById('prefectures-table')){
        drawPrefectureTable(ddb.prefectures, ddb.totals)
      }

      // Toggle the lang picker
      document.querySelectorAll('a[data-lang-picker]').forEach(function(el){
        el.style.display = 'inline'
      })
      document.querySelector('a[data-lang-picker='+LANG+']').style.display = 'none'

    })
  })
}

window.onload = function(){

  initDataTranslate()
  drawMap()

  var pageDraws = 0
  var styleLoaded = false
  var jsonData = undefined
  const FIVE_MINUTES_IN_MS = 300000

  function whenMapAndDataReady(){
    // This runs drawMapPref only when
    // both style and json data are ready

    if(!styleLoaded || !jsonData){
      return
    }

    drawMapPrefectures(pageDraws)
  }

  map.once('style.load', function(e) {
    styleLoaded = true
    whenMapAndDataReady()
  })

  function loadDataOnPage() {
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

      whenMapAndDataReady()
    })
  }

  loadDataOnPage()

  // Reload data every INTERVAL
  setInterval(function() {
    pageDraws++
    loadDataOnPage()
  }, FIVE_MINUTES_IN_MS)
}

/***/ }),

/***/ "./src/index.scss":
/*!************************!*\
  !*** ./src/index.scss ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ 0:
/*!*********************************************!*\
  !*** multi ./src/index.js ./src/index.scss ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./src/index.js */"./src/index.js");
module.exports = __webpack_require__(/*! ./src/index.scss */"./src/index.scss");


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5zY3NzP2Q2M2QiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpQkFBaUI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsV0FBVyxnQ0FBZ0M7QUFDM0MsV0FBVyxpQ0FBaUM7QUFDNUM7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLG1CQUFtQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUwsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQSxLQUFLO0FBQ0wsR0FBRztBQUNIOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7OztBQ3BoQkEsdUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi9cIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuIiwibWFwYm94Z2wuYWNjZXNzVG9rZW4gPVxuICAgICdway5leUoxSWpvaWFYTmhibXRoWkc0aUxDSmhJam9pWTJzM2RtSXhZbXhoTUdKMk9UTm1iekpuWmpGeGNtRjZaeUo5LlBnajZmOEg3TnBDUkkxZk5PSzNNZkEnXG5jb25zdCBQUkVGRUNUVVJFX0pTT05fUEFUSCA9ICdzdGF0aWMvcHJlZmVjdHVyZXMuZ2VvanNvbidcbmNvbnN0IEpTT05fUEFUSCA9ICdodHRwczovL2NvdmlkLTE5c2wuczMtYXAtbm9ydGhlYXN0LTEuYW1hem9uYXdzLmNvbS9kYXRhLmpzb24nXG5jb25zdCBUSU1FX0ZPUk1BVCA9ICdZWVlZLU1NLUREJ1xuY29uc3QgQ09MT1JfQ09ORklSTUVEID0gJ3JnYigyNDQsNjcsNTQpJ1xuY29uc3QgQ09MT1JfUkVDT1ZFUkVEID0gJ3JnYigyNSwxMTgsMjEwKSdcbmNvbnN0IENPTE9SX0RFQ0VBU0VEID0gJ3JnYig1NSw3MSw3OSknXG5jb25zdCBDT0xPUl9JTkNSRUFTRSA9ICdyZ2IoMTYzLDE3MiwxOTEpJ1xuY29uc3QgUEFHRV9USVRMRSA9ICdDb3JvbmF2aXJ1cyBEaXNlYXNlIChDT1ZJRC0xOSkgU3JpIExhbmthIFRyYWNrZXInXG5sZXQgTEFORyA9ICdlbidcbi8vaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvZS8yUEFDWC0xdlNDUkh6VFg4MlFJeWVZUnd5ekVkTHNRWk43dXE4WnFmNUQxbEg1Zzk5cUJiT3Z5UVFmMHhKaXQ0V3ZRZTJ4Rnl6ZWUzVXJtWEVrWmtMYS9wdWI/b3V0cHV0PWNzdlxuLy8gR2xvYmFsIHZhcnNcbmxldCBkZGIgPSB7XG4gIHByZWZlY3R1cmVzOiB1bmRlZmluZWQsXG4gIHRyZW5kOiB1bmRlZmluZWQsXG4gIHRvdGFsczoge1xuICAgIGNvbmZpcm1lZDogMCxcbiAgICByZWNvdmVyZWQ6IDAsXG4gICAgZGVjZWFzZWQ6IDAsXG4gICAgdGVzdGVkOiAwLFxuICAgIGNyaXRpY2FsOiAwXG4gIH0sXG4gIHRvdGFsc0RpZmY6IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIHRlc3RlZDogMCxcbiAgICBjcml0aWNhbDogMFxuICB9XG59XG5sZXQgbWFwID0gdW5kZWZpbmVkXG5cblxuLy8gSUUxMSBmb3JFYWNoIFBvbHlmaWxsXG5pZiAoJ05vZGVMaXN0JyBpbiB3aW5kb3cgJiYgIU5vZGVMaXN0LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gIGNvbnNvbGUuaW5mbygncG9seWZpbGwgZm9yIElFMTEnKTtcbiAgTm9kZUxpc3QucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB0aGlzQXJnID0gdGhpc0FyZyB8fCB3aW5kb3c7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXNbaV0sIGksIHRoaXMpO1xuICAgIH1cbiAgfTtcbn1cblxuXG5cbmZ1bmN0aW9uIGxvYWREYXRhKGNhbGxiYWNrKSB7XG4gIC8vIExvYWQgdGhlIGpzb24gZGF0YSBmaWxlXG5cbiAgZmV0Y2goSlNPTl9QQVRIKVxuICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgIHJldHVybiByZXMuanNvbigpXG4gIH0pXG4gIC50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgIGNhbGxiYWNrKGRhdGEpXG4gIH0pXG59XG5cblxuZnVuY3Rpb24gY2FsY3VsYXRlVG90YWxzKGRhaWx5KSB7XG4gIC8vIENhbGN1bGF0ZSB0aGUgdG90YWxzXG5cbiAgbGV0IHRvdGFscyA9IHtcbiAgICBjb25maXJtZWQ6IDAsXG4gICAgcmVjb3ZlcmVkOiAwLFxuICAgIGRlY2Vhc2VkOiAwLFxuICAgIGNyaXRpY2FsOiAwLFxuICAgIHRlc3RlZDogMFxuICB9XG4gIGxldCB0b3RhbHNEaWZmID0ge1xuICAgIGNvbmZpcm1lZDogMSxcbiAgICByZWNvdmVyZWQ6IDEsXG4gICAgZGVjZWFzZWQ6IDEsXG4gICAgY3JpdGljYWw6IDEsXG4gICAgdGVzdGVkOiAxXG4gIH1cblxuICAvLyBJZiB0aGVyZSBpcyBhbiBlbXB0eSBjZWxsLCBmYWxsIGJhY2sgdG8gdGhlIHByZXZpb3VzIHJvd1xuICBmdW5jdGlvbiBwdWxsTGF0ZXN0U3VtQW5kRGlmZihrZXkpIHtcbiAgICBpZihkYWlseVtkYWlseS5sZW5ndGgtMV1ba2V5XS5sZW5ndGgpe1xuICAgICAgdG90YWxzW2tleV0gPSBwYXJzZUludChkYWlseVtkYWlseS5sZW5ndGgtMV1ba2V5XSlcbiAgICAgIHRvdGFsc0RpZmZba2V5XSA9IHRvdGFsc1trZXldIC0gcGFyc2VJbnQoZGFpbHlbZGFpbHkubGVuZ3RoLTJdW2tleV0pXG4gICAgfWVsc2V7XG4gICAgICB0b3RhbHNba2V5XSA9IHBhcnNlSW50KGRhaWx5W2RhaWx5Lmxlbmd0aC0yXVtrZXldKVxuICAgICAgdG90YWxzRGlmZltrZXldID0gdG90YWxzW2tleV0gLSBwYXJzZUludChkYWlseVtkYWlseS5sZW5ndGgtM11ba2V5XSlcbiAgICB9XG4gIH1cblxuICBwdWxsTGF0ZXN0U3VtQW5kRGlmZigndGVzdGVkJylcbiAgcHVsbExhdGVzdFN1bUFuZERpZmYoJ2NyaXRpY2FsJylcbiAgcHVsbExhdGVzdFN1bUFuZERpZmYoJ2NvbmZpcm1lZCcpXG4gIHB1bGxMYXRlc3RTdW1BbmREaWZmKCdyZWNvdmVyZWQnKVxuICBwdWxsTGF0ZXN0U3VtQW5kRGlmZignZGVjZWFzZWQnKVxuXG4gIHJldHVybiBbdG90YWxzLCB0b3RhbHNEaWZmXVxufVxuXG5cbmZ1bmN0aW9uIGRyYXdNYXAoKSB7XG4gIC8vIEluaXRpYWxpemUgTWFwXG5cbiAgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgICBjb250YWluZXI6ICdtYXAtY29udGFpbmVyJyxcbiAgICAgIHN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12MTAnLFxuICAgICAgem9vbTogMixcbiAgICAgIG1pblpvb206IDAuNSxcbiAgICAgIG1heFpvb206IDksXG4gICAgICBjZW50ZXI6IHtcbiAgICAgICAgICBsbmc6IDcuMjk0NTQ1LFxuICAgICAgICAgIGxhdDogODAuNjA4MjcxOVxuICAgICAgfSxcbiAgICAgIG1heEJvdW5kczogW1xuICAgICAgICAgIHsgbGF0OiAyLjA2NjY1NSwgbG5nOiA3Ni4yNDIyNjEgfSwgLy8gU1dcbiAgICAgICAgICB7IGxhdDogMTMuMzIzMDY5LCBsbmc6IDg0LjEzMDg4NyB9IC8vIE5FXG4gICAgICBdXG4gIH0pXG5cbiAgbWFwLmRyYWdSb3RhdGUuZGlzYWJsZSgpXG4gIG1hcC50b3VjaFpvb21Sb3RhdGUuZGlzYWJsZVJvdGF0aW9uKClcbiAgbWFwLnNjcm9sbFpvb20uZGlzYWJsZSgpXG4gIG1hcC5hZGRDb250cm9sKG5ldyBtYXBib3hnbC5OYXZpZ2F0aW9uQ29udHJvbCh7XG4gICAgc2hvd0NvbXBhc3M6IGZhbHNlLFxuICAgIHNob3dab29tOiB0cnVlXG4gIH0pKVxufVxuXG5cbmZ1bmN0aW9uIGRyYXdUcmVuZENoYXJ0KHNoZWV0VHJlbmQpIHtcblxuICBsZXQgbGFzdFVwZGF0ZWQgPSAnJ1xuICBsZXQgbGFiZWxTZXQgPSBbXVxuICBsZXQgY29uZmlybWVkU2V0ID0gW11cbiAgbGV0IHJlY292ZXJlZFNldCA9IFtdXG4gIGxldCBkZWNlYXNlZFNldCA9IFtdXG4gIGxldCBkYWlseUluY3JlYXNlU2V0ID0gW11cblxuICBsZXQgcHJldkNvbmZpcm1lZCA9IC0xXG4gIHNoZWV0VHJlbmQubWFwKGZ1bmN0aW9uKHRyZW5kRGF0YSl7XG4gICAgbGFiZWxTZXQucHVzaChuZXcgRGF0ZSh0cmVuZERhdGEuZGF0ZSkpXG4gICAgY29uZmlybWVkU2V0LnB1c2goe1xuICAgICAgeDogbmV3IERhdGUodHJlbmREYXRhLmRhdGUpLFxuICAgICAgeTogcGFyc2VJbnQodHJlbmREYXRhLmNvbmZpcm1lZClcbiAgICB9KVxuICAgIHJlY292ZXJlZFNldC5wdXNoKHtcbiAgICAgIHg6IG5ldyBEYXRlKHRyZW5kRGF0YS5kYXRlKSxcbiAgICAgIHk6IHBhcnNlSW50KHRyZW5kRGF0YS5yZWNvdmVyZWQpXG4gICAgfSlcbiAgICBkZWNlYXNlZFNldC5wdXNoKHtcbiAgICAgIHg6IG5ldyBEYXRlKHRyZW5kRGF0YS5kYXRlKSxcbiAgICAgIHk6IHBhcnNlSW50KHRyZW5kRGF0YS5kZWNlYXNlZClcbiAgICB9KVxuICAgIGRhaWx5SW5jcmVhc2VTZXQucHVzaCh7XG4gICAgICB4OiBuZXcgRGF0ZSh0cmVuZERhdGEuZGF0ZSksXG4gICAgICB5OiBwcmV2Q29uZmlybWVkID09PSAtMSA/IDAgOiBwYXJzZUludCh0cmVuZERhdGEuY29uZmlybWVkKSAtIHByZXZDb25maXJtZWRcbiAgICB9KVxuXG4gICAgcHJldkNvbmZpcm1lZCA9IHBhcnNlSW50KHRyZW5kRGF0YS5jb25maXJtZWQpXG4gICAgbGFzdFVwZGF0ZWQgPSB0cmVuZERhdGEuZGF0ZVxuICB9KVxuXG4gIHZhciBjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHJlbmQtY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpXG4gIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udEZhbWlseSA9IFwiJ09wZW4gU2FucycsIGhlbHZldGljYSwgc2Fucy1zZXJpZlwiXG4gIENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Rm9udFNpemUgPSAxNlxuICBDaGFydC5kZWZhdWx0cy5nbG9iYWwuZGVmYXVsdEZvbnRDb2xvciA9ICdyZ2IoMCwxMCwxOCknXG5cbiAgdmFyIGNoYXJ0ID0gbmV3IENoYXJ0KGN0eCwge1xuICAgIHR5cGU6ICdsaW5lJyxcbiAgICBkYXRhOiB7XG4gICAgICBsYWJlbHM6IGxhYmVsU2V0LFxuICAgICAgZGF0YXNldHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnRGVjZWFzZWQnLFxuICAgICAgICAgIGJvcmRlckNvbG9yOiBDT0xPUl9ERUNFQVNFRCxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENPTE9SX0RFQ0VBU0VELFxuICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgIGRhdGE6IGRlY2Vhc2VkU2V0XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ1JlY292ZXJlZCcsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IENPTE9SX1JFQ09WRVJFRCxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IENPTE9SX1JFQ09WRVJFRCxcbiAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICBkYXRhOiByZWNvdmVyZWRTZXRcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnQ29uZmlybWVkJyxcbiAgICAgICAgICBib3JkZXJDb2xvcjogQ09MT1JfQ09ORklSTUVELFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ09MT1JfQ09ORklSTUVELFxuICAgICAgICAgIGZpbGw6IGZhbHNlLFxuICAgICAgICAgIGRhdGE6IGNvbmZpcm1lZFNldFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdEYWlseSBJbmNyZWFzZScsXG4gICAgICAgICAgYm9yZGVyQ29sb3I6IENPTE9SX0lOQ1JFQVNFLFxuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogQ09MT1JfSU5DUkVBU0UsXG4gICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgZGF0YTogZGFpbHlJbmNyZWFzZVNldFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBtYWludGFpbkFzcGVjdFJhdGlvOiBmYWxzZSxcbiAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICBlbGVtZW50czoge1xuICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgdGVuc2lvbjogMC4xXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBsZWdlbmQ6IHtcbiAgICAgICAgZGlzcGxheTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgc2NhbGVzOiB7XG4gICAgICAgIHhBeGVzOiBbe1xuICAgICAgICAgIHR5cGU6ICd0aW1lJyxcbiAgICAgICAgICB0aW1lOiB7XG4gICAgICAgICAgICBwYXJzZXI6IFRJTUVfRk9STUFULFxuICAgICAgICAgICAgcm91bmQ6ICdkYXknLFxuICAgICAgICAgICAgdG9vbHRpcEZvcm1hdDogJ2xsJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2NhbGVMYWJlbDoge1xuICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAnRGF0ZSdcbiAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICBzY2FsZUxhYmVsOiB7XG4gICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICdDYXNlcydcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBkcmF3UHJlZmVjdHVyZVRhYmxlKHByZWZlY3R1cmVzLCB0b3RhbHMpIHtcbiAgLy8gRHJhdyB0aGUgQ2FzZXMgQnkgUHJlZmVjdHVyZSB0YWJsZVxuXG4gIGxldCBkYXRhVGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcHJlZmVjdHVyZXMtdGFibGUgdGJvZHknKVxuICBsZXQgdW5zcGVjaWZpZWRSb3cgPSAnJ1xuXG4gIC8vIFJlbW92ZSB0aGUgbG9hZGluZyBjZWxsXG4gIGRhdGFUYWJsZS5pbm5lckhUTUwgPSAnJ1xuXG4gIC8vIFBhcnNlIHZhbHVlcyBzbyB3ZSBjYW4gc29ydFxuICBfLm1hcChwcmVmZWN0dXJlcywgZnVuY3Rpb24ocHJlZil7XG4gICAgLy8gVE9ETyBjaGFuZ2UgdG8gY29uZmlybWVkXG4gICAgcHJlZi5jb25maXJtZWQgPSAocHJlZi5jYXNlcz9wYXJzZUludChwcmVmLmNhc2VzKTowKVxuICAgIHByZWYucmVjb3ZlcmVkID0gKHByZWYucmVjb3ZlcmVkP3BhcnNlSW50KHByZWYucmVjb3ZlcmVkKTowKVxuICAgIC8vIFRPRE8gY2hhbmdlIHRvIGRlY2Vhc2VkXG4gICAgcHJlZi5kZWNlYXNlZCA9IChwcmVmLmRlYXRocz9wYXJzZUludChwcmVmLmRlYXRocyk6MClcbiAgfSlcblxuICAvLyBJdGVyYXRlIHRocm91Z2ggYW5kIHJlbmRlciB0YWJsZSByb3dzXG4gIF8ub3JkZXJCeShwcmVmZWN0dXJlcywgJ2NvbmZpcm1lZCcsICdkZXNjJykubWFwKGZ1bmN0aW9uKHByZWYpe1xuICAgIGlmKCFwcmVmLmNvbmZpcm1lZCAmJiAhcHJlZi5yZWNvdmVyZWQgJiYgIXByZWYuZGVjZWFzZWQpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IHByZWZTdHJcbiAgICBpZihMQU5HID09ICdlbicpe1xuICAgICAgICBwcmVmU3RyID0gcHJlZi5wcmVmZWN0dXJlXG4gICAgfWVsc2V7XG4gICAgICBwcmVmU3RyID0gcHJlZi5wcmVmZWN0dXJlamFcbiAgICB9XG5cbiAgICAvLyBUT0RPIE1ha2UgdGhpcyBwcmV0dHlcblxuICAgIGlmKHByZWYucHJlZmVjdHVyZSA9PSAnVW5zcGVjaWZpZWQnKXtcbiAgICAgIC8vIFNhdmUgdGhlIFwiVW5zcGVjaWZpZWRcIiByb3cgZm9yIHRoZSBlbmQgb2YgdGhlIHRhYmxlXG4gICAgICB1bnNwZWNpZmllZFJvdyA9IFwiPHRyPjx0ZD48ZW0+XCIgKyBwcmVmU3RyICsgXCI8L2VtPjwvdGQ+PHRkPlwiICsgcHJlZi5jb25maXJtZWQgKyBcIjwvdGQ+PHRkPlwiICsgcHJlZi5yZWNvdmVyZWQgKyBcIjwvdGQ+PHRkPlwiICsgcHJlZi5kZWF0aHMgKyBcIjwvdGQ+PC90cj5cIlxuICAgIH1lbHNlIGlmIChwcmVmLnByZWZlY3R1cmUgPT0gJ1RvdGFsJyl7XG4gICAgICAvLyBTa2lwXG4gICAgfWVsc2V7XG4gICAgICBkYXRhVGFibGUuaW5uZXJIVE1MID0gZGF0YVRhYmxlLmlubmVySFRNTCArIFwiPHRyPjx0ZD5cIiArIHByZWZTdHIgKyBcIjwvdGQ+PHRkPlwiICsgcHJlZi5jb25maXJtZWQgKyBcIjwvdGQ+PHRkPjwvdGQ+PHRkPlwiICsgKHByZWYuZGVjZWFzZWQ/cHJlZi5kZWNlYXNlZDonJykgKyBcIjwvdGQ+PC90cj5cIlxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9KVxuXG4gIGRhdGFUYWJsZS5pbm5lckhUTUwgPSBkYXRhVGFibGUuaW5uZXJIVE1MICsgdW5zcGVjaWZpZWRSb3dcblxuICBsZXQgdG90YWxTdHIgPSAnVG90YWwnXG4gIGlmKExBTkcgPT0gJ2phJyl7XG4gICAgdG90YWxTdHIgPSAn6KiIJ1xuICB9XG5cbiAgZGF0YVRhYmxlLmlubmVySFRNTCA9IGRhdGFUYWJsZS5pbm5lckhUTUwgKyBcIjx0ciBjbGFzcz0ndG90YWxzJz48dGQ+XCIgKyB0b3RhbFN0ciArIFwiPC90ZD48dGQ+XCIgKyB0b3RhbHMuY29uZmlybWVkICsgXCI8L3RkPjx0ZD5cIiArIHRvdGFscy5yZWNvdmVyZWQgKyBcIjwvdGQ+PHRkPlwiICsgdG90YWxzLmRlY2Vhc2VkICsgXCI8L3RkPjwvdHI+XCJcbn1cblxuXG5mdW5jdGlvbiBkcmF3S3Bpcyh0b3RhbHMsIHRvdGFsc0RpZmYpIHtcbiAgLy8gRHJhdyB0aGUgS1BJIHZhbHVlc1xuXG4gIGZ1bmN0aW9uIHNldEtwaShrZXksIHZhbHVlKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2twaS0nICsga2V5ICsgJyAudmFsdWUnKS5pbm5lckhUTUwgPSB2YWx1ZVxuICB9XG4gIGZ1bmN0aW9uIHNldEtwaURpZmYoa2V5LCB2YWx1ZSkge1xuICAgIGxldCBkaWZmRGlyID0gKHZhbHVlID49IDA/JysnOicnKVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNrcGktJyArIGtleSArICcgLmRpZmYnKS5pbm5lckhUTUwgPSAnKCAnICsgZGlmZkRpciArIHZhbHVlICsgJyApJ1xuICB9XG5cbiAgc2V0S3BpKCdjb25maXJtZWQnLCB0b3RhbHMuY29uZmlybWVkKVxuICBzZXRLcGlEaWZmKCdjb25maXJtZWQnLCB0b3RhbHNEaWZmLmNvbmZpcm1lZClcbiAgc2V0S3BpKCdyZWNvdmVyZWQnLCB0b3RhbHMucmVjb3ZlcmVkKVxuICBzZXRLcGlEaWZmKCdyZWNvdmVyZWQnLCB0b3RhbHNEaWZmLnJlY292ZXJlZClcbiAgc2V0S3BpKCdkZWNlYXNlZCcsIHRvdGFscy5kZWNlYXNlZClcbiAgc2V0S3BpRGlmZignZGVjZWFzZWQnLCB0b3RhbHNEaWZmLmRlY2Vhc2VkKVxuICBzZXRLcGkoJ2NyaXRpY2FsJywgdG90YWxzLmNyaXRpY2FsKVxuICBzZXRLcGlEaWZmKCdjcml0aWNhbCcsIHRvdGFsc0RpZmYuY3JpdGljYWwpXG4gIHNldEtwaSgndGVzdGVkJywgdG90YWxzLnRlc3RlZClcbiAgc2V0S3BpRGlmZigndGVzdGVkJywgdG90YWxzRGlmZi50ZXN0ZWQpXG4gIHNldEtwaSgnYWN0aXZlJywgKHRvdGFscy5jb25maXJtZWQgLSB0b3RhbHMucmVjb3ZlcmVkKSAtIHRvdGFscy5kZWNlYXNlZClcbiAgc2V0S3BpRGlmZignYWN0aXZlJywgKHRvdGFsc0RpZmYuY29uZmlybWVkIC0gdG90YWxzRGlmZi5yZWNvdmVyZWQpIC0gdG90YWxzRGlmZi5kZWNlYXNlZClcblxufVxuXG5cbmZ1bmN0aW9uIGRyYXdMYXN0VXBkYXRlZChsYXN0VXBkYXRlZCkge1xuICAvLyBEcmF3IHRoZSBsYXN0IHVwZGF0ZWQgdGltZVxuXG4gIC8vIFRPRE8gd2Ugc2hvdWxkIGJlIHBhcnNpbmcgdGhlIGRhdGUsIGJ1dCBJXG4gIC8vIGRvbid0IHRydXN0IHRoZSB1c2VyIGlucHV0IG9uIHRoZSBzaGVldFxuICAvL2xldCBwcmV0dHlVcGRhdGVkVGltZSA9IG1vbWVudChsYXN0VXBkYXRlZCkuZm9ybWF0KCdNTU0gRCwgWVlZWScpICsgJyBKU1QnXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYXN0LXVwZGF0ZWQnKS5pbm5lckhUTUwgPSBsYXN0VXBkYXRlZFxufVxuXG5cbmZ1bmN0aW9uIGRyYXdQYWdlVGl0bGVDb3VudChjb25maXJtZWQpIHtcbiAgLy8gVXBkYXRlIHRoZSBudW1iZXIgb2YgY29uZmlybWVkIGNhc2VzIGluIHRoZSB0aXRsZVxuXG4gIGRvY3VtZW50LnRpdGxlID0gXCIoXCIgKyBjb25maXJtZWQgKyBcIikgXCIgKyBQQUdFX1RJVExFXG59XG5cbi8qKlxuICogZHJhd01hcFByZWZlY3R1cmVzXG4gKiBAcGFyYW0geyp9IHBhZ2VEcmF3cyAtIG51bWJlciBvZiByZWRyYXdzIHRvIHNjcmVlblxuICovXG5mdW5jdGlvbiBkcmF3TWFwUHJlZmVjdHVyZXMocGFnZURyYXdzKSB7XG4gIC8vIEZpbmQgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBzeW1ib2wgbGF5ZXJcbiAgLy8gaW4gdGhlIG1hcCBzdHlsZSBzbyB3ZSBjYW4gZHJhdyB0aGVcbiAgLy8gcHJlZmVjdHVyZSBjb2xvcnMgYmVoaW5kIGl0XG5cbiAgdmFyIGZpcnN0U3ltYm9sSWRcbiAgdmFyIGxheWVycyA9IG1hcC5nZXRTdHlsZSgpLmxheWVyc1xuICBmb3IodmFyIGkgPSAwOyBpIDwgbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYobGF5ZXJzW2ldLnR5cGUgPT09ICdzeW1ib2wnKSB7XG4gICAgICBmaXJzdFN5bWJvbElkID0gbGF5ZXJzW2ldLmlkXG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBTdGFydCB0aGUgTWFwYm94IHNlYXJjaCBleHByZXNzaW9uXG4gIGxldCBwcmVmZWN0dXJlUGFpbnQgPSBbXG4gICAgJ21hdGNoJyxcbiAgICBbJ2dldCcsICdOQU1FXzEnXSxcbiAgXVxuXG4gIC8vIEdvIHRocm91Z2ggYWxsIHByZWZlY3R1cmVzIGxvb2tpbmcgZm9yIGNhc2VzXG4gIGRkYi5wcmVmZWN0dXJlcy5tYXAoZnVuY3Rpb24ocHJlZmVjdHVyZSl7XG5cbiAgICBsZXQgY2FzZXMgPSBwYXJzZUludChwcmVmZWN0dXJlLmNhc2VzKVxuICAgIGlmKGNhc2VzID4gMCl7XG4gICAgICBwcmVmZWN0dXJlUGFpbnQucHVzaChwcmVmZWN0dXJlLnByZWZlY3R1cmUpXG5cbiAgICAgIGlmKGNhc2VzIDw9IDEwKXtcbiAgICAgICAgLy8gMS0xMCBjYXNlc1xuICAgICAgICBwcmVmZWN0dXJlUGFpbnQucHVzaCgncmdiKDI1MywyMzQsMjAzKScpXG4gICAgICB9ZWxzZSBpZihjYXNlcyA8PSAyNSl7XG4gICAgICAgIC8vIDExLTI1IGNhc2VzXG4gICAgICAgIHByZWZlY3R1cmVQYWludC5wdXNoKCdyZ2IoMjUxLDE1NSwxMjcpJylcbiAgICAgIH1lbHNlIGlmKGNhc2VzIDw9IDUwKXtcbiAgICAgICAgLy8gMjYtNTAgY2FzZXNcbiAgICAgICAgcHJlZmVjdHVyZVBhaW50LnB1c2goJ3JnYigyNDQsNjcsNTQpJylcbiAgICAgIH1lbHNle1xuICAgICAgICAvLyA1MSsgY2FzZXNcbiAgICAgICAgcHJlZmVjdHVyZVBhaW50LnB1c2goJ3JnYigxODYsMCwxMyknKVxuICAgICAgfVxuICAgIH1cblxuICB9KVxuXG4gIC8vIEFkZCBhIGZpbmFsIHZhbHVlIHRvIHRoZSBsaXN0IGZvciB0aGUgZGVmYXVsdCBjb2xvclxuICBwcmVmZWN0dXJlUGFpbnQucHVzaCgncmdiYSgwLDAsMCwwKScpXG5cblxuICBpZiAocGFnZURyYXdzID09PSAwKSB7XG4gICAgLy8gSWYgaXQgaXMgdGhlIGZpcnN0IHRpbWUgZHJhd2luZyB0aGUgbWFwXG5cbiAgICBtYXAuYWRkU291cmNlKCdwcmVmZWN0dXJlcycsIHtcbiAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgIGRhdGE6IFBSRUZFQ1RVUkVfSlNPTl9QQVRILFxuICAgIH0pXG5cbiAgICAvLyBBZGQgdGhlIHByZWZlY3R1cmUgY29sb3IgbGF5ZXIgdG8gdGhlIG1hcFxuICAgIG1hcC5hZGRMYXllcih7XG4gICAgICAnaWQnOiAncHJlZmVjdHVyZS1sYXllcicsXG4gICAgICAndHlwZSc6ICdmaWxsJyxcbiAgICAgICdzb3VyY2UnOiAncHJlZmVjdHVyZXMnLFxuICAgICAgJ2xheW91dCc6IHt9LFxuICAgICAgJ3BhaW50Jzoge1xuICAgICAgICAnZmlsbC1jb2xvcic6IHByZWZlY3R1cmVQYWludCxcbiAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDAuOFxuICAgICAgfVxuICAgIH0sIGZpcnN0U3ltYm9sSWQpXG5cbiAgICAvLyBBZGQgYW5vdGhlciBsYXllciB3aXRoIHR5cGUgXCJsaW5lXCJcbiAgICAvLyB0byBwcm92aWRlIGEgc3R5bGVkIHByZWZlY3R1cmUgYm9yZGVyXG4gICAgbGV0IHByZWZCb3JkZXJMYXllciA9IG1hcC5hZGRMYXllcih7XG4gICAgICAnaWQnOiAncHJlZmVjdHVyZS1vdXRsaW5lLWxheWVyJyxcbiAgICAgICd0eXBlJzogJ2xpbmUnLFxuICAgICAgJ3NvdXJjZSc6ICdwcmVmZWN0dXJlcycsXG4gICAgICAnbGF5b3V0Jzoge30sXG4gICAgICAncGFpbnQnOiB7XG4gICAgICAgICdsaW5lLXdpZHRoJzogMC41LFxuICAgICAgICAnbGluZS1jb2xvcic6ICcjYzBjMGMwJyxcbiAgICAgICAgJ2xpbmUtb3BhY2l0eSc6IDAuNVxuICAgICAgfVxuICAgIH0sIGZpcnN0U3ltYm9sSWQpXG5cbiAgfSBlbHNlIHtcbiAgICAvLyBVcGRhdGUgcHJlZmVjdHVyZSBwYWludCBwcm9wZXJ0aWVzXG5cbiAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eSgncHJlZmVjdHVyZS1sYXllcicsICdmaWxsLWNvbG9yJywgcHJlZmVjdHVyZVBhaW50KVxuXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdERhdGFUcmFuc2xhdGUoKSB7XG4gIC8vIEhhbmRsZSBsYW5ndWFnZSBzd2l0Y2hpbmcgdXNpbmcgZGF0YSBwYXJhbXNcblxuICBjb25zdCBzZWxlY3RvciA9ICdbZGF0YS1qYV0nXG4gIGNvbnN0IHBhcnNlTm9kZSA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikuZm9yRWFjaChjYilcbiAgfVxuXG4gIC8vIERlZmF1bHQgd2Vic2l0ZSBpcyBpbiBFbmdsaXNoLiBFeHRyYWN0IGl0IGFzIHRoZSBhdHRyIGRhdGEtZW49XCIuLi5cIlxuICBwYXJzZU5vZGUoZnVuY3Rpb24oZWwpIHtcbiAgICBlbC5kYXRhc2V0WydlbiddID0gZWwudGV4dENvbnRlbnRcbiAgfSlcblxuICAvLyBMYW5ndWFnZSBzZWxlY3RvciBldmVudCBoYW5kbGVyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWxhbmctcGlja2VyXScpLmZvckVhY2goZnVuY3Rpb24ocGljaykge1xuICAgIHBpY2suYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgTEFORyA9IGUudGFyZ2V0LmRhdGFzZXQubGFuZ1BpY2tlclxuXG4gICAgICAvLyBUb2dnbGUgdGhlIGh0bWwgbGFuZyB0YWdzXG4gICAgICBwYXJzZU5vZGUoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKCFlbC5kYXRhc2V0W0xBTkddKSByZXR1cm47XG4gICAgICAgIGVsLnRleHRDb250ZW50ID0gZWwuZGF0YXNldFtMQU5HXVxuICAgICAgfSlcblxuICAgICAgLy8gVXBkYXRlIHRoZSBtYXBcbiAgICAgIG1hcC5nZXRTdHlsZSgpLmxheWVycy5mb3JFYWNoKGZ1bmN0aW9uKHRoaXNMYXllcil7XG4gICAgICAgIGlmKHRoaXNMYXllci50eXBlID09ICdzeW1ib2wnKXtcbiAgICAgICAgICBtYXAuc2V0TGF5b3V0UHJvcGVydHkodGhpc0xheWVyLmlkLCAndGV4dC1maWVsZCcsIFsnZ2V0JywnbmFtZV8nICsgTEFOR10pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFJlZHJhdyB0aGUgcHJlZmVjdHVyZXMgdGFibGVcbiAgICAgIGlmKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmVmZWN0dXJlcy10YWJsZScpKXtcbiAgICAgICAgZHJhd1ByZWZlY3R1cmVUYWJsZShkZGIucHJlZmVjdHVyZXMsIGRkYi50b3RhbHMpXG4gICAgICB9XG5cbiAgICAgIC8vIFRvZ2dsZSB0aGUgbGFuZyBwaWNrZXJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FbZGF0YS1sYW5nLXBpY2tlcl0nKS5mb3JFYWNoKGZ1bmN0aW9uKGVsKXtcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnXG4gICAgICB9KVxuICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYVtkYXRhLWxhbmctcGlja2VyPScrTEFORysnXScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgIH0pXG4gIH0pXG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpe1xuXG4gIGluaXREYXRhVHJhbnNsYXRlKClcbiAgZHJhd01hcCgpXG5cbiAgdmFyIHBhZ2VEcmF3cyA9IDBcbiAgdmFyIHN0eWxlTG9hZGVkID0gZmFsc2VcbiAgdmFyIGpzb25EYXRhID0gdW5kZWZpbmVkXG4gIGNvbnN0IEZJVkVfTUlOVVRFU19JTl9NUyA9IDMwMDAwMFxuXG4gIGZ1bmN0aW9uIHdoZW5NYXBBbmREYXRhUmVhZHkoKXtcbiAgICAvLyBUaGlzIHJ1bnMgZHJhd01hcFByZWYgb25seSB3aGVuXG4gICAgLy8gYm90aCBzdHlsZSBhbmQganNvbiBkYXRhIGFyZSByZWFkeVxuXG4gICAgaWYoIXN0eWxlTG9hZGVkIHx8ICFqc29uRGF0YSl7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBkcmF3TWFwUHJlZmVjdHVyZXMocGFnZURyYXdzKVxuICB9XG5cbiAgbWFwLm9uY2UoJ3N0eWxlLmxvYWQnLCBmdW5jdGlvbihlKSB7XG4gICAgc3R5bGVMb2FkZWQgPSB0cnVlXG4gICAgd2hlbk1hcEFuZERhdGFSZWFkeSgpXG4gIH0pXG5cbiAgZnVuY3Rpb24gbG9hZERhdGFPblBhZ2UoKSB7XG4gICAgbG9hZERhdGEoZnVuY3Rpb24oZGF0YSkge1xuICAgICAganNvbkRhdGEgPSBkYXRhXG5cbiAgICAgIGRkYi5wcmVmZWN0dXJlcyA9IGpzb25EYXRhLnByZWZlY3R1cmVzXG4gICAgICBsZXQgbmV3VG90YWxzID0gY2FsY3VsYXRlVG90YWxzKGpzb25EYXRhLmRhaWx5KVxuICAgICAgZGRiLnRvdGFscyA9IG5ld1RvdGFsc1swXVxuICAgICAgZGRiLnRvdGFsc0RpZmYgPSBuZXdUb3RhbHNbMV1cbiAgICAgIGRkYi50cmVuZCA9IGpzb25EYXRhLmRhaWx5XG4gICAgICBkZGIubGFzdFVwZGF0ZWQgPSBqc29uRGF0YS51cGRhdGVkWzBdLmxhc3R1cGRhdGVkXG5cbiAgICAgIGRyYXdLcGlzKGRkYi50b3RhbHMsIGRkYi50b3RhbHNEaWZmKVxuICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5jb250YWlucygnZW1iZWQtbW9kZScpKSB7XG4gICAgICAgIGRyYXdMYXN0VXBkYXRlZChkZGIubGFzdFVwZGF0ZWQpXG4gICAgICAgIGRyYXdQYWdlVGl0bGVDb3VudChkZGIudG90YWxzLmNvbmZpcm1lZClcbiAgICAgICAgZHJhd1ByZWZlY3R1cmVUYWJsZShkZGIucHJlZmVjdHVyZXMsIGRkYi50b3RhbHMpXG4gICAgICAgIGRyYXdUcmVuZENoYXJ0KGRkYi50cmVuZClcbiAgICAgIH1cblxuICAgICAgd2hlbk1hcEFuZERhdGFSZWFkeSgpXG4gICAgfSlcbiAgfVxuXG4gIGxvYWREYXRhT25QYWdlKClcblxuICAvLyBSZWxvYWQgZGF0YSBldmVyeSBJTlRFUlZBTFxuICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBwYWdlRHJhd3MrK1xuICAgIGxvYWREYXRhT25QYWdlKClcbiAgfSwgRklWRV9NSU5VVEVTX0lOX01TKVxufSIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpbiJdLCJzb3VyY2VSb290IjoiIn0=