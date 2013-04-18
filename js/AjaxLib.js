/**
 * 
 * Librer�a AjaxLib v 1.0
 * 
 * Realiza peticiones AJAX de manera sencilla y autom�tica.
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

/** Especifica opciones para m�todo 
 */
var $metodo =  {
	GET: "GET",
	POST: "POST"
}


/**
 * Realiza un nuevo requerimiento AJAX a la url especificada
 * con las opciones definidas
 * @param {String} url La URL a donde realizar la petici�n
 * @param {Object} opciones Un objeto JSON con los atributos opcionales que queremos definirle.
 * 
 * opciones disponibles:
 * 	  id: Un identificador interno para ser recibido junto a los datos
 *    metodo: $metodo.POST o $metodo.GET
 *    tipoRespuesta: $tipo.TEXTO, $tipo.JSON o $tipo.XML
 *    parametros: un string en formato URL o un objeto Hash
 *    cache: true o false
 *    avisoCargando: define el id de un elemento que queremos usar 
 * 			como cartel de "Cargando" mientras la petici�n se hace
 *    onfinish: funci�n a ejecutarse cuando se reciban los datos.
 * 		    Esta funci�n recibir� el Texto, JSON o XML recibido y el id de la petici�n.
 *    onerror: funci�n a ejecutarse cuando ocurra un error. 
 * 			Esta funci�n recibe un objeto con detalles del error y el id de la petici�n
 */
function $Ajax(url, opciones) {	
	// Preguntamos si no quiere Cach�
	if (__$P(opciones, "cache", true)==false){
		// Agregamos un par�metro random a la URL
		// Ponemos ? o & seg�n ya haya par�metro anteriores
		var caracter = "?";
		if (url.indexOf("?")>0) caracter = "&";
		url += caracter + Math.random();
	}
	var metodo = __$P(opciones, "metodo", $metodo.GET);
	var parametros = __$P(opciones, "parametros");

	// Genera JSON de propiedades necesarias para Prototype
	// En un futuro puede ser reemplazado por otra librer�a
	var protoOpc = {
		method: metodo,
		onSuccess: __$AjaxRecibir.bind(this, opciones),
		onException: __$AjaxError.bind(this, opciones),
		onFailure: __$AjaxError.bind(this, opciones)
	}
	
	// Si se definieron los par�metros los agregamos
	if (parametros!=undefined) {
	    protoOpc.parameters = parametros;
	}
   
    // Genera la nueva petici�n v�a Prototype
	var peticion = new Ajax.Request(url, protoOpc);
 
    // Prende el cartel de Cargando, si existiera
    if (__$P(opciones, "avisoCargando")!=undefined) {
    	__$AjaxCargando(opciones.avisoCargando, true);
    }    
    
}

/**
 * Funci�n interna que se encarga de recibir la petici�n lista
 * desde Prototype y ejecutar el evento onfinish de la petici�n
 */
function __$AjaxRecibir(opciones, xhr) {
    // Si se ejecuta este m�todo estamos seguros que 
    // readyState==4 y status==200 
    
    // Apagamos cartel de Cargando si existiera 
    if (__$P(opciones, "avisoCargando")!=undefined) {
    	__$AjaxCargando(opciones.avisoCargando, false);
    }      
    
    // Traemos la funci�n onfinish si fue definida
    var funcionRetorno = __$P(opciones, "onfinish");
    // Traemos el identificador de la petici�n si fue definido
    var id = __$P(opciones, "id");
    
	if (funcionRetorno!= undefined) {
	    // Si el usuario indic� que quiere recibir la respuesta
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
			   // Intentamos evaluar el JSON por si no es v�lido
			   var objeto;
			   try {
				    objeto = xhr.responseText.evalJSON();
			   } catch (e) {
					__$AjaxError(opciones, xhr, {code: -1, message: "JSON No v�lido" });
				    return;
			   }
			   funcionRetorno(objeto, id);
		}			
	}	
	
}



/**
 * Funci�n interna que se encarga de prender o apagar el cartel
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
 * Funci�n interna que se encarga de recibir la ejecuci�n
 * cuando ocurra alg�n error en la petici�n desde Prototype
 */
function __$AjaxError(opciones, xhr, excepcion) {
    // Apagamos cartel de Cargando si existiera 
   if (__$P(opciones, "avisoCargando")!=undefined) {
   		__$AjaxCargando(opciones.avisoCargando, false);
   }   	
	
   // Cuando se trata de un error de servidor, no hay excepci�n
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
 * Funci�n interna que se encarga de entregar un par�metro opcional
 * desde una colecci�n tipo JSON, con un valor por defecto
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

