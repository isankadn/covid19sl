!function(e){var t={};function r(a){if(t[a])return t[a].exports;var n=t[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,a){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(r.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(a,n,function(t){return e[t]}.bind(null,n));return a},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/",r(r.s=0)}([function(e,t,r){r(1),e.exports=r(2)},function(e,t){mapboxgl.accessToken="pk.eyJ1IjoiaXNhbmthZG4iLCJhIjoiY2s3eGI3ams2MDFsMTNmcjRsdnh4ZTNpOSJ9.C7esI-qqpgWXdPbZe04aOw";let r="en";let a={prefectures:void 0,trend:void 0,totals:{confirmed:0,recovered:0,deceased:0,tested:0,critical:0},totalsDiff:{confirmed:0,recovered:0,deceased:0,tested:0,critical:0}},n=void 0;function o(e,t){let a=document.querySelector("#prefectures-table tbody"),n="";a.innerHTML="",_.map(e,(function(e){console.log(e.recovered),e.confirmed=e.cases?parseInt(e.cases):0,e.recovered=e.recovered?parseInt(e.recovered):0,e.deceased=e.deaths?parseInt(e.deaths):0})),_.orderBy(e,"confirmed","desc").map((function(e){if(!e.confirmed&&!e.recovered&&!e.deceased)return;let t;return t="en"==r?e.prefecture:e.prefectureja,"Unspecified"==e.prefecture?n="<tr><td><em>"+t+"</em></td><td>"+e.confirmed+"</td><td>"+e.recovered+"</td><td>"+e.deaths+"</td></tr>":"Total"==e.prefecture||(a.innerHTML=a.innerHTML+"<tr><td>"+t+"</td><td>"+e.confirmed+"</td><td>"+e.recovered+"</td><td>"+(e.deceased?e.deceased:0)+"</td></tr>"),!0})),a.innerHTML=a.innerHTML+n;let o="Total";"ja"==r&&(o="計"),a.innerHTML=a.innerHTML+"<tr class='totals'><td>"+o+"</td><td>"+t.confirmed+"</td><td>"+t.recovered+"</td><td>"+t.deceased+"</td></tr>"}"NodeList"in window&&!NodeList.prototype.forEach&&(console.info("polyfill for IE11"),NodeList.prototype.forEach=function(e,t){t=t||window;for(var r=0;r<this.length;r++)e.call(t,this[r],r,this)}),window.onload=function(){!function(){const e=function(e){document.querySelectorAll("[data-ja]").forEach(e)};e((function(e){e.dataset.en=e.textContent})),document.querySelectorAll("[data-lang-picker]").forEach((function(t){t.addEventListener("click",(function(t){t.preventDefault(),r=t.target.dataset.langPicker,e((function(e){e.dataset[r]&&(e.textContent=e.dataset[r])})),n.getStyle().layers.forEach((function(e){"symbol"==e.type&&n.setLayoutProperty(e.id,"text-field",["get","name_"+r])})),document.getElementById("prefectures-table")&&o(a.prefectures,a.totals),document.querySelectorAll("a[data-lang-picker]").forEach((function(e){e.style.display="inline"})),document.querySelector("a[data-lang-picker="+r+"]").style.display="none"}))}))}(),n=new mapboxgl.Map({container:"map-container",style:"mapbox://styles/mapbox/light-v10",zoom:2,minZoom:1,maxZoom:7,center:{lng:7.294545,lat:80.6082719},maxBounds:[{lat:2.066655,lng:76.242261},{lat:13.323069,lng:84.130887}]}),n.dragRotate.disable(),n.touchZoomRotate.disableRotation(),n.scrollZoom.disable(),n.addControl(new mapboxgl.NavigationControl({showCompass:!1,showZoom:!0}));var e=0,t=!1,d=void 0;function l(){t&&d&&function(e){for(var t,r=n.getStyle().layers,o=0;o<r.length;o++)if("symbol"===r[o].type){t=r[o].id;break}let d=["match",["get","NAME_1"]];if(a.prefectures.map((function(e){let t=parseInt(e.cases);t>0&&(d.push(e.prefecture),t<=10?d.push("rgb(253,234,203)"):t<=25?d.push("rgb(251,155,127)"):t<=50?d.push("rgb(244,67,54)"):d.push("rgb(186,0,13)"))})),d.push("rgba(0,0,0,0)"),0===e){n.addSource("prefectures",{type:"geojson",data:"static/prefectures.geojson"}),n.addLayer({id:"prefecture-layer",type:"fill",source:"prefectures",layout:{},paint:{"fill-color":d,"fill-opacity":.8}},t);n.addLayer({id:"prefecture-outline-layer",type:"line",source:"prefectures",layout:{},paint:{"line-width":.5,"line-color":"#c0c0c0","line-opacity":.5}},t)}else n.setPaintProperty("prefecture-layer","fill-color",d)}(e)}function c(){var e;e=function(e){d=e,a.prefectures=d.prefectures;let t=function(e){let t={confirmed:0,recovered:0,deceased:0,critical:0,tested:0},r={confirmed:1,recovered:1,deceased:1,critical:1,tested:1};function a(a){e[e.length-1][a].length?(t[a]=parseInt(e[e.length-1][a]),r[a]=t[a]-parseInt(e[e.length-2][a])):(t[a]=parseInt(e[e.length-2][a]),r[a]=t[a]-parseInt(e[e.length-3][a]))}return a("tested"),a("critical"),a("confirmed"),a("recovered"),a("deceased"),[t,r]}(d.daily);var r,n;a.totals=t[0],a.totalsDiff=t[1],a.trend=d.daily,a.lastUpdated=d.updated[0].lastupdated,function(e,t){function r(e,t){document.querySelector("#kpi-"+e+" .value").innerHTML=t}function a(e,t){let r=t>=0?"+":"";document.querySelector("#kpi-"+e+" .diff").innerHTML="( "+r+t+" )"}r("confirmed",e.confirmed),a("confirmed",t.confirmed),r("recovered",e.recovered),a("recovered",t.recovered),r("deceased",e.deceased),a("deceased",t.deceased),r("critical",e.critical),a("critical",t.critical),r("tested",e.tested),a("tested",t.tested),r("active",e.confirmed-e.recovered-e.deceased),a("active",t.confirmed-t.recovered-t.deceased)}(a.totals,a.totalsDiff),document.body.classList.contains("embed-mode")||(n=a.lastUpdated,document.getElementById("last-updated").innerHTML=n,r=a.totals.confirmed,document.title="("+r+") Coronavirus Disease (COVID-19) Sri Lanka Tracker",o(a.prefectures,a.totals),function(e){let t="",r=[],a=[],n=[],o=[],d=[],l=-1;e.map((function(e){r.push(new Date(e.date)),a.push({x:new Date(e.date),y:parseInt(e.confirmed)}),n.push({x:new Date(e.date),y:parseInt(e.recovered)}),o.push({x:new Date(e.date),y:parseInt(e.deceased)}),d.push({x:new Date(e.date),y:-1===l?0:parseInt(e.confirmed)-l}),l=parseInt(e.confirmed),t=e.date}));var c=document.getElementById("trend-chart").getContext("2d");Chart.defaults.global.defaultFontFamily="'Open Sans', helvetica, sans-serif",Chart.defaults.global.defaultFontSize=16,Chart.defaults.global.defaultFontColor="rgb(0,10,18)",new Chart(c,{type:"line",data:{labels:r,datasets:[{label:"Deceased",borderColor:"rgb(55,71,79)",backgroundColor:"rgb(55,71,79)",fill:!1,data:o},{label:"Recovered",borderColor:"rgb(4,148,39)",backgroundColor:"rgb(4,148,39)",fill:!1,data:n},{label:"Confirmed",borderColor:"rgb(244,67,54)",backgroundColor:"rgb(244,67,54)",fill:!1,data:a},{label:"Daily Increase",borderColor:"rgb(163,172,191)",backgroundColor:"rgb(163,172,191)",fill:!1,data:d}]},options:{maintainAspectRatio:!1,responsive:!0,elements:{line:{tension:.1}},legend:{display:!1},scales:{xAxes:[{type:"time",time:{parser:"YYYY-MM-DD",round:"day",tooltipFormat:"ll"},scaleLabel:{display:!0,labelString:"Date"}}],yAxes:[{scaleLabel:{display:!0,labelString:"Cases"}}]}}})}(a.trend)),l()},fetch("https://covid-19sl.s3-ap-northeast-1.amazonaws.com/data.json").then((function(e){return e.json()})).then((function(t){e(t)}))}function i(){var e;e=function(e){jsonHpbData=e,hospitalData=jsonHpbData.data.hospital_data,function(e){let t=document.querySelector("#hospital-table tbody");t.innerHTML="",_.map(e,(function(e){e.hospitalname=e.hospital.name,e.testedtotal=e.cumulative_total,e.treatmenttotal=e.treatment_total})),_.orderBy(e,"testedtotal","desc").map((function(e){(e.hospitalname||e.testedtotal||e.treatmenttotal)&&(t.innerHTML=t.innerHTML+"<tr><td class='hospitalname'>"+e.hospitalname+"</td><td>"+e.testedtotal+"</td><td>"+e.treatmenttotal+"</td></tr>")}))}(hospitalData);let t=0;for(var r=0;r<hospitalData.length;r++)t+=hospitalData[r].treatment_total;var a;document.body.classList.contains("embed-mode")||(a="&nbsp ("+t+")",document.querySelector("#kpi-tested .hositalized").innerHTML=a)},fetch("http://hpb.health.gov.lk/api/get-current-statistical").then((function(e){return e.json()})).then((function(t){e(t)}))}n.once("style.load",(function(e){t=!0,l()})),c(),i(),setInterval((function(){e++,c(),i()}),3e5)}},function(e,t,r){}]);