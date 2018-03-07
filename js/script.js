var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 37.565315, lng: -122.322315},
        zoom: 16,
        mapTypeControl: false
    });    
}