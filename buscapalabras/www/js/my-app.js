// Initialize app
var myApp = new Framework7({
});

//If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var dict = new Triejs();
var MAX_PATRON=10;

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function ajustaPatron() {
	var longitud = $$("#longitud").val();
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
document.addEventListener('deviceready', function() {
	ajustaPatron();
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
	for (i=0;i<chars.length;i++)
	{
    	if ("ABCDEFGHIJKLMNOPQRSTUVWXYZÑ*".indexOf(chars[i].toUpperCase())==-1) {
    		myApp.alert("Los caracteres introducidos no son correctos, intente nuevamente", 'Error');
    		return false;
    	}
		if (chars[i].toLowerCase()=='ñ') {
			var final_char = '#';
		}
		else {
			var final_char = chars[i].toLowerCase();
		}
    	resultado['letras'].push(final_char);
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
    console.log("aqui");
    console.log(resultado);
    
    if (resultado) {
    	$$.getJSON('http://35.195.128.6/palabras',
    			{'letras': resultado['letras'].join(''),
    		      'mascara': resultado['mascara'].join(''),
    		      'longitud': resultado['longitud']},
    			function(data) {
    		    	var chip_content = '';
				    if (data['palabras'].length==0) {
				    	chip_content = chip_content +
				    		'<div class="chip"><div class="chip-label">No hay palabras</div></div>\n';				    	
				    }
				    else 
				    {
				    	for (var i=0;i<data['palabras'].length;i++) {
				    		var palabra_final = replaceAll(data['palabras'][i], '#', 'ñ');
				    		
				    		chip_content = chip_content +
				    			'<div class="chip"><div class="chip-label">'+ palabra_final + '</div></div>\n';
				    	}
				    }				    
				    $$("#chips_container_dict").html(chip_content);
				    
    		    	var chip_content = '';
				    if (data['posibles'].length==0) {
				    	chip_content = chip_content +
				    		'<div class="chip"><div class="chip-label">No hay palabras</div></div>\n';				    	
				    }
				    else 
				    {
				    	for (var i=0;i<data['posibles'].length;i++) {
				    		var palabra_final = replaceAll(data['posibles'][i], '#', 'ñ');
				    		
				    		chip_content = chip_content +
				    			'<div class="chip"><div class="chip-label">'+ palabra_final + '</div></div>\n';
				    	}
				    }
				    
				    $$("#chips_container_possible").html(chip_content);
				    
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
$$('#form-palabra').on('submit', function(e){	
    e.preventDefault();
	
    var chip = $$(this).parents(".chip");
    chip.remove();
    
	generaCombinaciones();
	
  });


$$("#longitud").on('input change', function(e) {
	ajustaPatron();
	});