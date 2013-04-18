$(document).ready(function (){
	crearLinks();
	alert('Cargando DOM');
	$( "#c" ).show( "drop", 1000 );
});
function crearLinks() {
	// Recorro todos los li dentro del Menu
	var opciones = $("#menu li");
		// Genero la acción del clic por cada uno
		opciones.click (function() {
			// utilizo el id de cada li como nombre de seccion
			mostrarSeccion(this.id);
		});
}
function mostrarSeccion(nombre) {
	$.ajax({url: nombre + ".html",
		cache: true,
		success:function(respuesta) {
			//inicio efecto desvanecimiento
			$("#contenido").fadeOut(function(){
			$(this)
			.html(respuesta)// definicion texto
			.fadeIn();//aparicion
			});
		}
	});
}
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/es_LA/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));




