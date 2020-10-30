var map = L.map('map', {
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
).addTo(map)

var myURL = jQuery('script[src$="leaf-demo.js"]').attr('src').replace('leaf-demo.js', '')

var myIcon = L.icon({
    iconUrl: myURL + 'images/pin24.png',
    iconRetinaUrl: myURL + 'images/pin48.png',
    iconSize: [29, 24],
    iconAnchor: [9, 21],
    popupAnchor: [0, -14]
})

for (var i = 0; i < markers.length; ++i) {
    L.marker([markers[i].lat, markers[i].lng], { icon: myIcon })
        .bindPopup('<a href="' + markers[i].url + '" target="_blank">' + markers[i].name + '</a>')
        .addTo(map);
}