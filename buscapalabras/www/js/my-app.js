// Initialize app
var myApp = new Framework7({pushState: true,});

//Initialize View          
var mainView = myApp.addView('.view-main')
        
//If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var dict = new Triejs();

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

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function ajustaPatron() {
	var longitud = $$("#longitud").val();
	$$('#longitud').prop({
        'min': 3,
        'max': MAX_PATRON
    });	
	$$("#outputLongitud").val(longitud);
	
	for (var i=1;i<=MAX_PATRON;i++) {
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
    				'En la versión premium, introduce <b>?</b> para usar comodines</div>',
    				'<div><i class="f7-icons size-22 color-black">help</i>&nbsp;Ayuda</div>');
    		});
    	
    	$$('#popup-largo').on('click', function () {
    		myApp.alert('<div class="page-content">Mueve el slider para seleccionar la longitud de la palabra a generar. '+
    				'La longitud va desde tres caracteres hasta ocho (diez en la versión premium).</div>',
    				'<div><i class="f7-icons size-22 color-black">help</i>&nbsp;Ayuda</div>');
    		});    	

    	$$('#popup-patron').on('click', function () {
    		myApp.alert('<div class="page-content">Introduce letras en la posición que desees para fijar las letras en la palabra a generar. Deja la casilla en blanco si quieres utilizar las letras que has escogido.</div>',
    				'<div><i class="f7-icons size-22 color-black">help</i>&nbsp;Ayuda</div>');
    		});    	

    	$$('#chips_container_dict').on('click', function () {
    		myApp.alert('<div class="page-content">Las palabras que se muestran son válidas y aparecen en nuestro diccionario.</div>',
    				'<div><i class="f7-icons size-22 color-black">help</i>&nbsp;Ayuda</div>');
    		});    	

    	$$('#chips_container_possible').on('click', function () {
    		myApp.alert('<div class="page-content">Estas palabras están generadas mediante reglas gramaticales y pueden no ser válidas.</div>',
    				'<div><i class="f7-icons size-22 color-black">help</i>&nbsp;Ayuda</div>');
    		});
    	

    }
});


function validarCaracteres() {
	var resultado = {
			'letras': [],
			'mascara': [],
			'longitud': 0
	}
	
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
		myApp.alert("Solo puedes introducir "+MAX_COMODINES+" comodines", "Error");
		return false;
	}
    
    // ahora validamos mascara
	var longitud = $$("#longitud").val();

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
    
    return resultado;
}

function generaCombinaciones() {
	myApp.showPreloader('Cargando...')
	
    // leemos todas las letras y chequeamos que tengan un valor valido y concuerden en longitud
    resultado = validarCaracteres();
    var final_items = [];
    
    if (resultado) {
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
				    $$("#chips_container_dict").html('<a href="#" class="link icon-only" id="popup-confirmadas"><i class="f7-icons size-15 color-black">help</i></a>&nbsp;'+chip_content);
				    
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
				    
				    $$("#chips_container_possible").html('<a href="#" class="link icon-only" id="popup-posibles"><i class="f7-icons size-15 color-black">help</i></a>&nbsp;'+chip_content);
				    
				    myApp.hidePreloader();
    			},
    			function(error) {
    				myApp.hidePreloader();
    			}
    	);
    }
    else {
		myApp.hidePreloader();
    	
    }
	
}

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
		
		if(AdMob) AdMob.createBanner({
			  adId: admobid.banner,
			  position: AdMob.AD_POSITION.BOTTOM_CENTER,
			  autoShow: true });		
	}
}