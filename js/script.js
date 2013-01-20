/* Application réalisée pour l'examen de janvier 2013 au cours de RIA sur base de l'API de betaseries
 * JS Document - /riamela/js/script.js
 * coded by Mélanie Klein 2383
 * janvier 2013
 */
( function ( $ ) {
    "use strict";

	// --- GLOBAL VARS
	   var $key = "3a9fcb2a47a5";

	// --- METHODS
        //Redimentionne les images en deux fois plus petit pour écrans rétina
        var resizeImg = function(){
            var $images = $('.retina');
            $images.each(function(i) {
                $(this).width($(this).width() / 2);
                $(this).height($(this).height() / 2);
            });
        };

        //Lancement de l'application
        var launchApp = function(e){
            //Cache/affiche les éléments
            $('#planning').hide();
            $('#mesSeries').hide();
            $('#accueil').hide();
            $('header').show();
            $('#ajoutSeries').show();
            $('footer').show();        
            $('#ajoutSeries h3').hide();
            //Remet à zéro la valeur de l'input de recherche
            $('#serie').val() == ' ';
            //Efface les résultats de recherche précédents
            $( ".resultats li" ).remove();          
            //Menu de navigation
            $('#searchSerie').on('click', displayResults);
            $('#menuPlanning').on('click',displayPlanning);
            $('#menuMesSeries').on('click',listSeries);
        };

        //Affiche les résultats de la recherche
        var displayResults = function ( e ) {
            //Empeche le comportement par défaut (=recharger la page)
            e.preventDefault();
            //Descend dans la page pour afficher les résultats
            $('html,body').animate({scrollTop:310}, 'slow');
            //Définit une variable pour la valeur de recherche entrée dans l'input
            var $search = $('#serie').val();
            //Si une série a été cherchée et que le texte entré a plus de deux caractères            
            if ( $search !== 0 && $search.length > 2 ) {
                $.ajax(
                   {
                        //Recupère les séries trouvées
                        url : "http://api.betaseries.com/shows/search.json?title="+$search+"&key="+$key,
                        type : "get",
                        dataType : "jsonp",
                        success : function ( e ) {

                            $('#ajoutSeries h3').show();
                            //Enlève les résultats obtenus précédemment                    
                            $( ".resultats li" ).remove(); 
                            //Pour chaque série trouvée, affiche le titre et passe l'url via l'attr class afin de pouvoir le récupérer ensuite                        
                            for( var i = 0; i < e.root.shows.length; i++ ) {  
                                $( "<li class='"+e.root.shows[i].url+"'><span>" + e.root.shows[i].title + "</span><button type='button' class='ajout' id='"+i+"'>Ajouter</button></li>" ).appendTo( ".resultats" );                        
                            }
                            //Au click sur Ajouter, lance la fonction
                            $('.ajout').on('click', storeSerie);
                        }
                    }
                )
            };
        };

        //Sauvegarde la série sélectionnée dans le localStorage
        var storeSerie = function(e){
            var object = $(this);
            //Récupère l'url de la serie qui a été passé dans l'attr class de l'élément cliqué
            var $serieTitle = object.parent().attr("class");  
            //Ajoute l'objet dans le localStorage      	
            addSerie( $serieTitle , function ( infoSerie ) {
                //Ajout de l'objet en le transformant en chaine de caractère avec un préfixe pour pouvoir le récupérer ensuite
                window.localStorage.setItem( "SH_" + $serieTitle , JSON.stringify( infoSerie ) );
                //Cache le formulaire d'ajout de série
                $('#ajoutSeries').hide();
            });
        };

        //Ajoute une série grâce aux infos récupérées sur betaSeries
        var addSerie = function(urlSerie, sucessCallback){
        	$.ajax(
        	{
        		url: 'http://api.betaseries.com/shows/display/'+urlSerie+'.json?hide_notes=1&key='+$key,
        		type: 'get',
        		dataType:'jsonp',
        		success : function(infoSerie){
        			sucessCallback.apply(null, [infoSerie]);
                    //Lance la fonction                    
                    listSeries();
        		}
        	}
        	)
        };

        //Liste les séries ajoutées
        var listSeries = function () {
                //Efface les séries précédentes, sinon série en double/triple
                $('#listeSeries li').remove();
                //Cache/affiche les éléments
                $('#ajoutSeries').hide();
                $('#mesSeries').show();
                $('#planning').hide();
                //Parcours le local storage
                for( var infoSerie in window.localStorage ){
                    //Si url commence par SH_ (le préfixe définit précédement)
                    if( infoSerie.substring( 0 , 3 ) === "SH_"){
                        ////Définit les variables qui vont servir ensuite
                        //Convertit la chaine du localStorage écrite en json en objet root qui contient les données de la série
                        var dataSerie = JSON.parse( window.localStorage.getItem( infoSerie ) );                        
                        var titleSerie = dataSerie.root.show.title;
                        var bannerSerie = dataSerie.root.show.banner;  
                        var descSerie = dataSerie.root.show.description;                        
                        var genderSerie = dataSerie.root.show.genres;
                        var durationEpi = dataSerie.root.show.duration;
                        var urlSerie = dataSerie.root.show.url;                      
                        //Ajoute des éléments au li pour afficher toutes les données                
                        $( "#listeSeries" ).append( "<li class='"+infoSerie+"'><div class='deleteBulle'><p>Supprimer la série ?</p><button class='oui2'>Oui</button><button class='non2'>Non</button><span id='triangle3'></span></div><span class='delete'><img width='30' height='30' src='img/delete.png'></span><img width='250' class='banner' src='"+bannerSerie+"'><h2 class='titre'>"+titleSerie+"</h2><span class='voirDetails'>Voir les détails</span><div class='detailsSerie'><span class='dureeEpi'>Episodes de "+durationEpi+" min</span><span class='genreSerie'>Genre: "+genderSerie+"</span><p class='descSerie'>"+descSerie+"</p><span class='moinsDetails'>Moins de détails</span></div></li>" );
                        //Affiche une image par défaut s'il n'y en a pas de disponible
                        if(bannerSerie === undefined){
                            $('img[src="' + undefined + '"]').attr('src', 'img/errorBanner.png');
                        } 
                        //Cache les éléments
                        $('.deleteBulle').hide();
                        $('.detailsSerie').hide();
                        //Au clic sur Voir détails, lance la fonction                        
                        $('.voirDetails').on('click', displayDetails);                        
                    }
                }                
                //Lance la fonction
                displayNbrSeries();
                //Au click sur la X, lance la fonction
                $('.delete').on('click',removeSerie);
                //Menu de navigation
                $('#menuPlanning').on('click',displayPlanning);
                $('#menuAjoutSerie').on('click',launchApp);                
        };

        //Affiche les détails d'une série
        var displayDetails = function(e){
            $(this).hide();
            $(this).next().slideDown();
            $('.moinsDetails').on('click',function(){
                $(this).parent().slideUp();
                $(this).parent().prev('.voirDetails').show();
            });
        };

        //Affiche le nombre de séries ajoutées
        var displayNbrSeries = function(){
            var nbreSeries = $('#listeSeries li').length;
            var spanNbreSeries = $('#nbreSeries');
            $('#nbreSeries em').html(nbreSeries); 
        };

        //Efface série si click sur OUI
        var removeSerie = function(e) {
            $(this).prev('.deleteBulle').show();
            var itemSerie = $( this ).parents("li").attr("class");            

            $('.oui2').on('click', function() {                
                $(this).parents("li").slideUp( function() {
                    $(this).remove();
                    displayNbrSeries();              
                });
                //Efface la série du localStorage
                window.localStorage.removeItem(itemSerie);
            });

            $('.non2').on('click', function(){ 
                $(this).parents('.deleteBulle').hide();
            });  
        };

        //Affiche le planning correspondant aux séries ajoutées
        var displayPlanning = function(e) { 
            //Cache/Affiche les éléments             
            $('#ajoutSeries').hide();     
            $('#mesSeries').hide();
            $('#planning').show();
            $.ajax(
            {
                url:'http://api.betaseries.com/planning/general.json?key='+$key,
                type:'get',
                dataType:'jsonp',
                success:function(monPlanning) {
                    //Efface les résultats précédents, sinon double/triple
                    $('#planning ul li').remove();
                    //Parcours les données de betaSeries
                    for(var i=0 ; i<monPlanning.root.planning.length ; i++){
                        var n=0, maSerie=[];
                        //Parcours le localStorage                        
                        for( var infoSerie in window.localStorage){
                            if(infoSerie.substring(0,3) === "SH_"){                                
                                maSerie[n] = infoSerie.split("_");
                                if(monPlanning.root.planning[i].url === maSerie[n][1]){
                                    //Change le format de la date, de millisecondes a une date
                                    var date = new Date(monPlanning.root.planning[i].date * 1000);                                    
                                    var months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
                                    var month = months[date.getMonth()];
                                    var day = date.getDate();
                                    var dateEpi = day + " " + month;
                                    //Retourne la date d'aujourd'hui en milliseconds
                                    var date2 = new Date();
                                    var currentDate = date2.getTime();
                                    //Ajout les éléments dans la liste des prochains épisodes
                                    $('#planning ul').append("<li><span class='dateEpisode'>"+dateEpi+"</span><h3>"+monPlanning.root.planning[i].show+"</h3><h4>Episode n°"+monPlanning.root.planning[i].episode+": "+monPlanning.root.planning[i].title+"</h4></li>");
                                    //Si la date de l'épisode est inférieure à la date d'aujourd'hui, change le design des épisodes passés
                                    if (date < currentDate){
                                        $('.dateEpisode').parents("li").css('opacity','0.5');
                                    }
                                }
                            }
                        }
                    }
                }
            }
            )
            //Menu de navigation
            $('#menuMesSeries').on('click',listSeries);
            $('#menuAjoutSerie').on('click',launchApp);
        };

        //Supprime tout au click sur OUI
        var resetAll = function(e){
            $('#resetBulle').show();
            $('#oui').on('click',function() {
                //Vide le localStorage
                localStorage.clear();
                location.reload();
            });
            $('#non').on('click', function(){ 
                $('#resetBulle').hide();
            });
        };


	$( function () {
	// --- ONLOAD ROUTINES
        //Lance la fonction
        resizeImg();
        //Cache les éléments
        $('header').hide();
        $('footer').hide();
        $('#ajoutSeries').hide();
        $('#mesSeries').hide();
        $('#planning').hide();
        $('#detailsSerie').hide();
        $('.resultats h3').hide();
        $('#resetBulle').hide();
        //Au click sur valider, l'application s'ouvre
        $('#accueil button').on('click',launchApp);
        //Au click sur l'icone-poubelle, on efface tout
        $('#reset').on('click', resetAll);
	});

}(jQuery));