function init_map(){
  var myOptions = {zoom:16,
    center:new google.maps.LatLng(40.9623544, 29.1109974),
    mapTypeId: google.maps.MapTypeId.ROADMAP};
  map = new google.maps.Map(document.getElementById("map"), myOptions);
  map.set('styles', [
{
    "featureType": "all",
    "elementType": "geometry.stroke",
    "stylers": [
        {
            "visibility": "simplified"
        }
    ]
},
{
    "featureType": "administrative",
    "elementType": "all",
    "stylers": [
        {
            "visibility": "off"
        }
    ]
},
{
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [
        {
            "visibility": "simplified"
        },
        {
            "color": "#151F50"
        }
    ]
},
{
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
        {
            "weight": "3.79"
        },
        {
            "visibility": "on"
        },
        {
            "color": "#ffecf0"
        }
    ]
},
{
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
        {
            "visibility": "on"
        }
    ]
},
{
    "featureType": "landscape",
    "elementType": "geometry.stroke",
    "stylers": [
        {
            "visibility": "on"
        }
    ]
},
{
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
        {
            "visibility": "simplified"
        },
        {
            "color": "#151F50"
        }
    ]
},
{
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
        {
            "saturation": "0"
        },
        {
            "lightness": "0"
        },
        {
            "visibility": "off"
        }
    ]
},
{
    "featureType": "poi",
    "elementType": "geometry.stroke",
    "stylers": [
        {
            "visibility": "off"
        }
    ]
},
{
    "featureType": "poi.business",
    "elementType": "all",
    "stylers": [
        {
            "visibility": "simplified"
        },
        {
            "color": "#FE4A6F"
        }
    ]
},
{
    "featureType": "poi.business",
    "elementType": "geometry",
    "stylers": [
        {
            "visibility": "on"
        }
    ]
},
{
    "featureType": "poi.business",
    "elementType": "geometry.fill",
    "stylers": [
        {
            "visibility": "on"
        },
        {
            "saturation": "0"
        }
    ]
},
{
    "featureType": "poi.business",
    "elementType": "labels",
    "stylers": [
        {
            "color": "#151F50"
        }
    ]
},
{
    "featureType": "poi.business",
    "elementType": "labels.icon",
    "stylers": [
        {
            "visibility": "simplified"
        },
        {
            "lightness": "84"
        }
    ]
},
{
    "featureType": "road",
    "elementType": "all",
    "stylers": [
        {
            "saturation": -100
        },
        {
            "lightness": 45
        }
    ]
},
{
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
        {
            "visibility": "simplified"
        }
    ]
},
{
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
        {
            "visibility": "off"
        }
    ]
},
{
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
        {
            "visibility": "off"
        }
    ]
},
{
    "featureType": "water",
    "elementType": "all",
    "stylers": [
        {
            "color": "#FE4A6F"
        },
        {
            "visibility": "on"
        }
    ]
},
{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
        {
            "visibility": "on"
        },
        {
            "color": "#151F50"
        }
    ]
},
{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
        {
            "visibility": "off"
        }
    ]
}
]);
  marker = new google.maps.Marker({map: map,position: new google.maps.LatLng(40.9623544, 29.1109974)});
  infowindow = new google.maps.InfoWindow({content:"<b>Dedeman Bostanci Hotel & Convention Center</b><br/>İçerenköy Mahallesi, Değirmen Yolu Cd. <br>No: 39C, 34752 Ataşehir<br>İstanbul"});
  google.maps.event.addListener(marker, "click", function(){infowindow.open(map,marker);});
  infowindow.open(map,marker);
}
google.maps.event.addDomListener(window, 'load', init_map);