// Initialize app
var myApp = new Framework7({pushState: true,});

//Initialize View          
var mainView = myApp.addView('.view-main')
        
//If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

//var PREMIUM = 0;
var PREMIUM = 0;
if (PREMIUM) {
	var MAX_PATRON=10;
	var MAX_COMODINES=3;
}
else {
	var MAX_PATRON=8;
	var MAX_COMODINES=0;
}

var resultado = {
		'letras': [],
		'mascara': [],
		'longitud': 0,
		'mostrar_anuncio': false,
}
function initResultado()
{
	resultado['letras'] = [];
	resultado['mascara'] = [];
	resultado['longitud'] = 0;
	resultado['mostrar_anuncio'] = false;
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function preparaAnuncio() {
	if (AdMob) {
		AdMob.prepareRewardVideoAd({
			adId: 'ca-app-pub-3102751369411439/5206345444',
			autoShow: false
		});			
	}
}
function ajustaPatron() {
	var longitud = $$("#longitud").val();
	$$('#longitud').prop({
        'min': 3,
        'max': 10
    });	
	$$("#outputLongitud").val(longitud);
	
	for (var i=1;i<=10;i++) {
		if (i<=longitud) {
			$$("#mask"+i).show();
		}
		else {
			$$("#mask"+i).hide();
			$$("#mask"+i).val("");
		}
	}
}

document.addEventListener('pageInit', function (e) {
    page = e.detail.page;
        
    if (page.name === 'app') {
    	ajustaPatron();
    	
    	$$("#longitud").on('input change', function(e) {
    		ajustaPatron();
    		});
    	
    	$$('#form-palabra').on('submit', function(e){	
    	    e.preventDefault();
    		
    	    var chip = $$(this).parents(".chip");
    	    chip.remove();
    	    
    		generaCombinaciones();
    		
    	  });
    	
    	
    	$$('#popup-letras').on('click', function () {
    		myApp.alert('<div class="page-content">Introduce hasta siete letras para formar tu palabra. '+
    				'Introduce <b>?</b> para usar comodines. Necesitarás ser premium o visualizar un anuncio cuando utilices comodines.</div>',
    				'<div><img src="img/sign-question-icon.png" alt="ayuda" width=25 />&nbsp;Ayuda</div>');
    		});
    	
    	$$('#popup-largo').on('click', function () {
    		myApp.alert('<div class="page-content">Mueve el slider para seleccionar la longitud de la palabra a generar. '+
    				'La longitud va desde tres caracteres hasta diez. Para longitudes 9 y 10, deberás ser premium o visualizar un anuncio.</div>',
    				'<div><img src="img/sign-question-icon.png" alt="ayuda" width=25 />&nbsp;Ayuda</div>');
    		});    	

    	$$('#popup-patron').on('click', function () {
    		myApp.alert('<div class="page-content">Introduce letras en la posición que desees para fijar las letras en la palabra a generar. Deja la casilla en blanco si quieres utilizar las letras que has escogido.</div>',
    				'<div><img src="img/sign-question-icon.png" alt="ayuda" width=25 />&nbsp;Ayuda</div>');
    		});    	

    	$$('#chips_container_dict').on('click', function () {
    		myApp.alert('<div class="page-content">Las palabras que se muestran son válidas y aparecen en nuestro diccionario.</div>',
    				'<div><img src="img/sign-question-icon.png" alt="ayuda" width=25 />&nbsp;Ayuda</div>');
    		});    	

    	$$('#chips_container_possible').on('click', function () {
    		myApp.alert('<div class="page-content">Estas palabras están generadas mediante reglas gramaticales y pueden no ser válidas.</div>',
    				'<div><img src="img/sign-question-icon.png" alt="ayuda" width=25 />&nbsp;Ayuda</div>');
    		});
    	
    	$$("#clear-pattern").on('click', function() {
    		for (var i=1;i<=10;i++)
    		{
    			$$("#mask"+i).val("");
    		}
    	});
    	
    	$$("#link-minimize").on("click", function() {
    		if (window.plugins.appMinimize) {
    			
    			// send notification to reopen
    			myApp.addNotification({
    				message: 'La app de Buscapalabras se ha minimizado.',
    				
    			});
    			window.plugins.appMinimize.minimize();
    			
    		}
    	});
    }
});


function validarCaracteres() {
	initResultado();
	
	var chars = $$("#chars").val();
	if (chars.length<2 || chars.length>7) {
		// validamos longitud minima y maxima
		myApp.alert("Debe introducir un mínimo de 2 letras y un máximo de 7", 'Error');
		return false;
   	}
	
	// validamos caracteres validos
	var num_comodines = 0;
	for (i=0;i<chars.length;i++)
	{
    	if ("ABCDEFGHIJKLMNOPQRSTUVWXYZÑ?".indexOf(chars[i].toUpperCase())==-1) {
    		myApp.alert("Los caracteres introducidos no son correctos, intente nuevamente", 'Error');
    		return false;
    	}
		if (chars[i].toLowerCase()=='ñ') {
			var final_char = '#';
		}
		else {
			var final_char = chars[i].toLowerCase();
		}
		
		if (chars[i].toLowerCase()=='?') {
			num_comodines++;
		}
    	resultado['letras'].push(final_char);
    }
	
	if (num_comodines>MAX_COMODINES) {
		resultado['mostrar_anuncio'] = true;
	}
	
    // ahora validamos mascara
	var longitud = $$("#longitud").val();
	if (longitud>MAX_PATRON) {
		resultado['mostrar_anuncio'] = true;
	}

	var fijas = 0;
    for (var i=1;i<=longitud;i++) {
		var char = $$("#mask"+i).val();
		if (char.length>0) {
	    	if ("ABCDEFGHIJKLMNOPQRSTUVWXYZÑ".indexOf(char.toUpperCase())==-1) {
	    		myApp.alert("Debe introducir una letra, intente nuevamente", 'Error');
	    		return false;
	    	}
			resultado['mascara'].push(char.toLowerCase());			
			fijas++;
		}
		else {
			resultado['mascara'].push('.');
		}
	}
    
    var total= fijas + Number(chars.length);
    if (total<Number(longitud)) {
		myApp.alert("Debe introducir las letras y longitud correcta", 'Error');
    	return false;
    }
        
    resultado['longitud'] = longitud;
    
    return true;
}

function devuelveResultados() {
	myApp.showPreloader('Cargando...')
	
	$$.getJSON('http://buscapalabras.ysoft.biz/palabras',
			{'letras': resultado['letras'].join(''),
		      'mascara': resultado['mascara'].join(''),
		      'longitud': resultado['longitud']},
			function(data) {
		    	var chip_content = '';
			    if (data['palabras'].length==0) {
			    	chip_content = chip_content +
			    		'<div class="chip green"><div class="chip-label">No hay palabras confirmadas</div></div>\n';				    	
			    }
			    else 
			    {
			    	for (var i=0;i<data['palabras'].length;i++) {
			    		var palabra_final = replaceAll(data['palabras'][i], '#', 'ñ');
			    		
			    		chip_content = chip_content +
			    			'<div class="chip green"><div class="chip-label">'+ palabra_final + '</div></div>\n';
			    	}
			    }				    
			    $$("#chips_container_dict").html('<a href="#" class="link icon-only" id="popup-confirmadas"><img src="img/sign-question-icon.png" alt="ayuda" width=20 /></a>&nbsp;'+chip_content);
			    
		    	var chip_content = '';
			    if (data['posibles'].length==0) {
			    	chip_content = chip_content +
			    		'<div class="chip blue"><div class="chip-label">No hay palabras opcionales</div></div>\n';				    	
			    }
			    else 
			    {
			    	for (var i=0;i<data['posibles'].length;i++) {
			    		var palabra_final = replaceAll(data['posibles'][i], '#', 'ñ');
			    		
			    		chip_content = chip_content +
			    			'<div class="chip blue"><div class="chip-label">'+ palabra_final + '</div></div>\n';
			    	}
			    }
			    
			    $$("#chips_container_possible").html('<a href="#" class="link icon-only" id="popup-posibles"><img src="img/sign-question-icon.png" alt="ayuda" width=25 /></a>&nbsp;'+chip_content);
			    
			    myApp.hidePreloader();
			},
			function(error) {
				myApp.hidePreloader();
			}
	);
	
}

function generaCombinaciones() {	
    // leemos todas las letras y chequeamos que tengan un valor valido y concuerden en longitud
    result = validarCaracteres();
    if (!result) return false;
	
	if (resultado['mostrar_anuncio']) {
		AdMob.showRewardVideoAd();				
		preparaAnuncio();
		
	}
    var final_items = [];
    
    var permite_extra = false;
    
	if (!resultado['mostrar_anuncio']) {
		devuelveResultados();
	}
}

document.addEventListener('onAdPresent', function(data) {
	if (data.adType == 'rewardvideo') {
		devuelveResultados();
	}
});


//Wait for PhoneGap to load
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    document.getElementById('exit_app').addEventListener('click', function() {
        navigator.app.exitApp();
    });
    
    if (!PREMIUM) {
    	var admobid = {};
		admobid = {
			      banner: 'ca-app-pub-3102751369411439/9704247246'
		}
		
		if(AdMob) {
			AdMob.createBanner({
			  adId: admobid.banner,
			  position: AdMob.AD_POSITION.BOTTOM_CENTER,
			  autoShow: true });
			
			preparaAnuncio();			
		}
	}
}