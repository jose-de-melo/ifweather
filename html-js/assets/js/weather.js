var apiKey = 'e7c77d5806c331095a7eac13be31b1f7';
var apiUrl = 'http://api.openweathermap.org/data/2.5/weather?id=';
var apiIDParam = '&APPID=' + apiKey;
var urlIconsAPI = 'https://openweathermap.org/img/w/';
var extensaoDosIcons = '.png';

$('#inputCity').on('keydown', function (event) {
    if (event.keyCode !== 13) return;
    pesquisarCidade();
});


function pesquisarCidade(){
    loadJSON('data/city.list.json', sucess, error);
}

function error(e){
    alert('Erro ao ler o arquivo de dados!');
    alert(e);
    return;
}

function sucess(myObj){
    var city = document.getElementById("inputCity").value;
    city = foldToASCII(city);
    var idCity;

    var cityList = myObj.cityList;
    var cidadeEncontrada = 0;

    for (i = 0; i < cityList.length; i++) {
        if(city.toLocaleLowerCase() == cityList[i].name.toLocaleLowerCase() ){
            idCity = cityList[i].id;
            cidadeEncontrada = 1;
            break;
        }
    }

    if(cidadeEncontrada == 0){
        alert('Não foram encontrados dados para cidade fornecida!');
    }else{
        getJSONCity(idCity);
    }
}

function loadJSON(url, success, error) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            try {
                var JSONObject = JSON.parse(xmlhttp.responseText);
                success(JSONObject);
            } catch (e) {
                error(e);
            }
        } else {
            var e = { "readyState": xmlhttp.readyState, "status": xmlhttp.status };
            if ([200, 0].indexOf(xmlhttp.status) == -1 && xmlhttp.readyState == 4) {
                error(e);
            }
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function getJSONCity(idCity){
    var urlFinalConsulta = montarUrl(idCity) ; //"data/weather.json" ; 

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onloadend = function() {
        var jsonResponse = JSON.parse(this.responseText);

        var latitude = parseFloat(jsonResponse.coord.lat);
        var longitude = parseFloat(jsonResponse.coord.lon);
        var nomeDoIcon = jsonResponse.weather[0].icon;
        var temperatura = converterKelvinEmCelsius(parseFloat(jsonResponse.main.temp));
        var temperaturaMinima = converterKelvinEmCelsius(parseFloat(jsonResponse.main.temp_min));
        var temperaturaMaxima = converterKelvinEmCelsius(parseFloat(jsonResponse.main.temp_max));
        var pressao = parseFloat(jsonResponse.main.pressure);
        var horaNascerDoSol = converterTimestampEmHora(parseInt(jsonResponse.sys.sunrise));
        var horaPorDoSol = converterTimestampEmHora(parseInt(jsonResponse.sys.sunset));

        var divMarcador = document.getElementById("marcador");


        var divPesquisa = '<div class="container" id="divTemp">'+
        '<div class="row shadow">'+
          '  <div class="col-lg-6 border-right border-success">'+
                '<br>'+
                '<div class="border-bottom"><h5>'+jsonResponse.name+'</h5></div>'+
                '<br>'+
                '<div>'+
                    '<h1>'+ temperatura +' ºC <img src="' + urlIconsAPI + nomeDoIcon + extensaoDosIcons + '"></h1>'+
                    '<br>' +
                    '<div style="float:left;margin-left:10px;"><h5>Temperatura Máxima<br>&nbsp;&nbsp;&nbsp;' + temperaturaMaxima + ' ºC <i class="fas fa-thermometer-full" style="color: #DC143C;font-size:25px;"></i></h5></div>' + 
                    '<div style="float:right;margin-right:10px;"><h5>Temperatura Mínima<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + temperaturaMinima + ' ºC <i class="fas fa-thermometer-quarter" style="color: #1E90FF;font-size:25px;"></i></h5></div>'+
                    '<div style="float:left;margin-left:10px;"><h5>Nascimento do Sol<br>&nbsp;&nbsp;&nbsp;' + horaNascerDoSol + ' <i class="fas fa-sun" style="color: #FF8C00;font-size:25px;"></i> </h5></div>'+
                    '<div style="float:right; margin-right:50px;"><h5>Pôr do Sol<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + horaPorDoSol + ' <i class="far fa-sun" style="color: #FF4500;font-size:23px;"></i> </h5></div>'+
                    '<br><br><br><br><br><div style="float:left;margin-left:10px;"><h5>Coordenadas<br>&nbsp;&nbsp;&nbsp;' + latitude + ',' + longitude + ' <i class="fas fa-map-marked-alt" style="color: #3CB371;font-size:23px;"></i></h5></div>'+
                    '<div style="float:right;margin-right:10px;margin-right:20px;"><h5>Pressão atmosférica<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + pressao + ' hpa <i class="fas fa-angle-double-down" style="color: #808080;font-size:23px;"></i></h5></div>' + 
                '</div>'+
            '</div>'+

                '<div class="col-lg-6 border-left border-success" id="map" style="width: 100vw; height: 80vh;">'+
                '</div>'+
            '</div>'+
        '</div>';

        var divTemp = document.getElementById('divTemp');

        if(divTemp != null){
            var node = document.getElementById("divTemp");
            if(node.parentNode){
                node.parentNode.removeChild(node);
            }
        }

        divMarcador.insertAdjacentHTML("afterend", divPesquisa);
        initMap(latitude, longitude, jsonResponse.name);
            
    };

    xmlhttp.open("GET", urlFinalConsulta, true);
    xmlhttp.send();
}

function montarUrl(idCity){
    return apiUrl + idCity + apiIDParam;
}

function converterKelvinEmCelsius(kTemp){
    return parseFloat((kTemp - 273.15).toFixed(2));
}

function converterTimestampEmHora(timestamp){
    var date = new Date(timestamp*1000);
    return ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2) + ':' + ("0" + date.getSeconds()).slice(-2);
}

function initMap(latitude, longitude, nomeCidade) {
    var myLatLng = {lat: latitude, lng: longitude};

    // Create a map object and specify the DOM element
    // for display.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 10
    });

    // Create a marker and set its position.
    var marker = new google.maps.Marker({
        map: map,
        position: myLatLng,
        title: nomeCidade
    });
}

    
