// Initialize app
var myApp = new Framework7({
});

//If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

document.addEventListener('deviceready', function() {
	  db = window.sqlitePlugin.openDatabase({name: 'diccionario.db', location: 'default'});
});

$$('#form-palabra').on('submit', function(e){
    e.preventDefault();

    var palabra = $$("#word").val();
    var longitud = $$("#longitud").val();
    
    if (palabra.length<=0) {
    	myApp.alert('La palabra es incorrecta, intente nuevamente', 'Error');
    }
    
    // generamos combinaciones de palabras con las letras y la longitud especificadas
    var letras = palabra.split('');
    var perm = Combinatorics.permutation(letras);
    
    var list_items = [];
    var palabras_buenas = [];
    
    while (a=perm.next()) {
    	var cmb = Combinatorics.bigCombination(a, longitud);
    	while (b=cmb.next())
    	{
    		// comprobamos si la palabra existe
    		db.transaction(function(tr) {
    			tr.executeSql("SELECT lower(palabra) from palabras where palabra='?'", b, function(tr, rs) {
    	    		var item = {};
    	    		item['title'] = b;
    	    		list_items.push(item);    				
    			});
    		});
    	}
    }
    
    var myList = myApp.virtualList('.list-block.virtual-list', {
        // Array with items data
        items: list_items,
        // Template 7 template to render each item
        template: '<li class="item-content">' +
                      '<div class="item-inner">' +
                          '<div class="item-title">{{title}}</div>' +
                      '</div>' +
                   '</li>'
    });     

  });
