/**
 * 
 * Librería AjaxLib v 1.0
 * 
 * Realiza peticiones AJAX de manera sencilla y automática.
 * 
 * @author Maximiliano R. Firtman firt@itmaster.es
 * 
 */


/** Especifica opciones para tipoRespuesta 
 */
var $tipo = {
	XML: 0,
	TEXTO: 1,
	JSON: 2	
}

/** Especifica opciones para método 
 */
var $metodo =  {
	GET: "GET",
	POST: "POST"
}


/**
 * Realiza un nuevo requerimiento AJAX a la url especificada
 * con las opciones definidas
 * @param {String} url La URL a donde realizar la petición
 * @param {Object} opciones Un objeto JSON con los atributos opcionales que queremos definirle.
 * 
 * opciones disponibles:
 * 	  id: Un identificador interno para ser recibido junto a los datos
 *    metodo: $metodo.POST o $metodo.GET
 *    tipoRespuesta: $tipo.TEXTO, $tipo.JSON o $tipo.XML
 *    parametros: un string en formato URL o un objeto Hash
 *    cache: true o false
 *    avisoCargando: define el id de un elemento que queremos usar 
 * 			como cartel de "Cargando" mientras la petición se hace
 *    onfinish: función a ejecutarse cuando se reciban los datos.
 * 		    Esta función recibirá el Texto, JSON o XML recibido y el id de la petición.
 *    onerror: función a ejecutarse cuando ocurra un error. 
 * 			Esta función recibe un objeto con detalles del error y el id de la petición
 */
function $Ajax(url, opciones) {	
	// Preguntamos si no quiere Caché
	if (__$P(opciones, "cache", true)==false){
		// Agregamos un parámetro random a la URL
		// Ponemos ? o & según ya haya parámetro anteriores
		var caracter = "?";
		if (url.indexOf("?")>0) caracter = "&";
		url += caracter + Math.random();
	}
	var metodo = __$P(opciones, "metodo", $metodo.GET);
	var parametros = __$P(opciones, "parametros");

	// Genera JSON de propiedades necesarias para Prototype
	// En un futuro puede ser reemplazado por otra librería
	var protoOpc = {
		method: metodo,
		onSuccess: __$AjaxRecibir.bind(this, opciones),
		onException: __$AjaxError.bind(this, opciones),
		onFailure: __$AjaxError.bind(this, opciones)
	}
	
	// Si se definieron los parámetros los agregamos
	if (parametros!=undefined) {
	    protoOpc.parameters = parametros;
	}
   
    // Genera la nueva petición vía Prototype
	var peticion = new Ajax.Request(url, protoOpc);
 
    // Prende el cartel de Cargando, si existiera
    if (__$P(opciones, "avisoCargando")!=undefined) {
    	__$AjaxCargando(opciones.avisoCargando, true);
    }    
    
}

/**
 * Función interna que se encarga de recibir la petición lista
 * desde Prototype y ejecutar el evento onfinish de la petición
 */
function __$AjaxRecibir(opciones, xhr) {
    // Si se ejecuta este método estamos seguros que 
    // readyState==4 y status==200 
    
    // Apagamos cartel de Cargando si existiera 
    if (__$P(opciones, "avisoCargando")!=undefined) {
    	__$AjaxCargando(opciones.avisoCargando, false);
    }      
    
    // Traemos la función onfinish si fue definida
    var funcionRetorno = __$P(opciones, "onfinish");
    // Traemos el identificador de la petición si fue definido
    var id = __$P(opciones, "id");
    
	if (funcionRetorno!= undefined) {
	    // Si el usuario indicó que quiere recibir la respuesta
	    // Suponemos TEXTO como tipo por defecto.
	    var tipoRespuesta = __$P(opciones, "tipoRespuesta", $tipo.TEXTO);
		switch(tipoRespuesta) {
			case $tipo.TEXTO:
				funcionRetorno(xhr.responseText, id);				
				break;
			case $tipo.XML:
			    funcionRetorno(xhr.responseXML, id);				
				break;
			case $tipo.JSON:
			   // Intentamos evaluar el JSON por si no es válido
			   var objeto;
			   try {
				    objeto = xhr.responseText.evalJSON();
			   } catch (e) {
					__$AjaxError(opciones, xhr, {code: -1, message: "JSON No válido" });
				    return;
			   }
			   funcionRetorno(objeto, id);
		}			
	}	
	
}



/**
 * Función interna que se encarga de prender o apagar el cartel
 * de Cargando, si existiera
 */
function __$AjaxCargando(cartel, prender) {
    if (prender) {
        $(cartel).show();
    } else {
        $(cartel).hide();
    }
}

/**
 * Función interna que se encarga de recibir la ejecución
 * cuando ocurra algún error en la petición desde Prototype
 */
function __$AjaxError(opciones, xhr, excepcion) {
    // Apagamos cartel de Cargando si existiera 
   if (__$P(opciones, "avisoCargando")!=undefined) {
   		__$AjaxCargando(opciones.avisoCargando, false);
   }   	
	
   // Cuando se trata de un error de servidor, no hay excepción
   if (excepcion==undefined) {
        // Supongo error de HTTP, genero mensaje propio
        excepcion = {code: xhr.status, message: "Error del servidor"}
   }   
   // Consulto si estaba definida el evento onerror
   var funcionError = __$P(opciones, "onerror");
   if (funcionError!=undefined) {
        funcionError(excepcion, __$P(opciones, "id"));
   }
}

/**
 * Función interna que se encarga de entregar un parámetro opcional
 * desde una colección tipo JSON, con un valor por defecto
 */
function __$P(coleccion, parametro, defecto) {
	if (coleccion==undefined) {
		return defecto;
	} else {
		if (coleccion[parametro]==undefined) {
			return defecto;
		} else {
			return coleccion[parametro];
		}
	}
}

