"use strict";
/*
	Le texte principal est lu au chargement de la page puis à chaque "iFrequenceSauvegarde_TextePrincipal" millisecondes, si $("#"+balise_MainText).data("dirtyBit") === true, la sauvegarde du texte principale est faite

	-Aussi- si l'usager clique le bouton "sauvegarder", le timeout est tué si $("#"+balise_MainText).data("dirtyBit") === true et la sauvegarde est forcée (pour les tests c'est 5 secs, je sais que c'est inutile/court, je pensais de 60 à 300 secondes une fois "en ligne")

===chronologie des fonctions:
	-chargerRoman
	-attente du retour XHR
	-appel à "afficherRoman"
	-setTimeout de "iFrequenceSauvegarde_TextePrincipal" millisecondes pour appel à sauvegarderTextePrincipal
	-si on as tapé dans le textarea contenant le document, $("#"+balise_MainText).data("dirtyBit") === true, la sauvegarde du texte principale est faite, attente XHR
	-xhrFunctions.js::execXHR_Request ( sauvegarde) => appel à lancerDelaiSauvegardeTextePrincipal
*/

/**********************
	CONFIGURATION / VARIABLES GLOBALES
**********************/
var gbl_DelaiSauvegarde_TextePrincipal = null; // SI on voulais arrêter le cycle d'enregistrement, il suffirais d'utiliser clearTimeout(gbl_DelaiSauvegarde_TextePrincipal);
var iFrequenceSauvegarde_TextePrincipal = 7000; // Le delai a attendre depuis la dernière frappe dans le texte principal ou les notes avant de lancer la sauvegarde
var iDelaiOcculterMessageSauvegarde = 5000; // Laps de temps durant lequel le message confirmant la sauvegarde doit rester à l'écran
var balise_MainText = "main_write";
//var balises_entites_base = "contenantEntites";
//var balises_entites_base = "edition-boite-entites>div";
var balises_entites_base = "edition-boite-entites";
var gblRoman;
var gblEntites = new Array();
var gblEntiteEnCoursEdition = -1; // si -1 alors aucune entitée en édition
var maintenant = Date.now();
var DirtyBits = {'onglet':'textePrincipal', 'textePrincipal_Memory':maintenant, 'textePrincipal_Disk':maintenant, 'notesGenerales_Memory':maintenant, 'notesGenerales_Disk':maintenant};


/**********************
	EVENT HANDLERS
**********************/
$(function(){
	// Handlers pour le textArea contenant le textePrincipal
	//$("#"+balise_MainText).data("dirtyBit", false);
	$("#"+balise_MainText).keyup(function(){
		//$("#"+balise_MainText).data("dirtyBit", true);
		//DirtyBits[DirtyBits['onglet']+'_Memory'] = Date.now();
		clearTimeout(gbl_DelaiSauvegarde_TextePrincipal);
		gbl_DelaiSauvegarde_TextePrincipal = setTimeout(function(){sauvegarderTextePrincipal(balise_MainText);}, iFrequenceSauvegarde_TextePrincipal);
	});

	//$(".col-md-8>ul>li").click(function(){
	$("#edition-boite-textePrincipal>ul>li").click(function(){
		if(!$(this).hasClass("active")){
			$(this).parent().children(".active").removeClass("active");
			$(this).addClass("active");

			//console.log(gblRoman['contenu']);
			//console.log(gblRoman['notes_globales']);

			if($(this).text() == "Composition"){
				//if($("#"+balise_MainText).data("dirtyBit") === true){
				//if(DirtyBits[DirtyBits['onglet']+'_Memory'] = Date.now();
					gblRoman['notes_globales'] = $("#"+balise_MainText).val();
					//console.log(gblRoman['notes_globales']);
					//$("#"+balise_MainText).data("dirtyBit", false);
					//DirtyBits[DirtyBits['onglet']+'_Memory'] = Date.now();
					DirtyBits['onglet'] = "textePrincipal";
				//}
				$("#"+balise_MainText).val(gblRoman['contenu']);
			}else{
				/*if($("#"+balise_MainText).data("dirtyBit") === true){
					gblRoman['contenu'] = $("#"+balise_MainText).val();
					//console.log(gblRoman['contenu']);
					$("#"+balise_MainText).data("dirtyBit", false);
				}*/
				gblRoman['contenu'] = $("#"+balise_MainText).val();
				//DirtyBits[DirtyBits['onglet']+'_Memory'] = Date.now();
				DirtyBits['onglet'] = "notesGenerales";
				$("#"+balise_MainText).val(gblRoman['notes_globales']);
			}
		}
	});

	$("#"+balises_entites_base+">ul>li").click(function(){
		TraiterClickOnglets_Entites($(this));
	});

	$("#"+balises_entites_base+">ul>li>ul>li").click(function(){
		TraiterClickOnglets_Entites($(this));
	});

	$("#"+balises_entites_base).on('click', '.aide-memoire-boutons-edition button', function(){
		/*
			Boutons "sauvegarder"/"annuler" des conteneurs "entitées"
		*/
		var idEntite = $(this).parents('.aide-memoire').data('idself');
		var spanChilds;
		var typeEntite;
		var iCmpt;

		console.log($(this).data("btntype"));
		console.log(idEntite);
		if($(this).data("btntype") == "cancel"){ // BOUTON "ANNULER"
			if(idEntite == 0){
				// Si le bouton appartient à une entité dont le idself = 0, donc c'est une nouvelle entitée non-enregistrée
				console.log("idself=0");
				$(this).parents('.aide-memoire').remove();
			}else{
				// annuler changements
				console.log("annuler changements");
				typeEntite = $("#"+balises_entites_base+">ul .active a").text();
				typeEntite = typeEntite.toLowerCase();
				typeEntite = typeEntite.replace('ù', 'u');
				typeEntite = typeEntite.replace('é', 'e');
				//$("#"+balises_entites_base+">div").find("span[contenteditable='true']").length
				$(this).parents('.aide-memoire').find("span[contenteditable='true']").removeAttr("contenteditable");
				spanChilds = $(this).parents('.aide-memoire').find("span");
				console.log(spanChilds);
				console.log(gblEntites[typeEntite][idEntite]);
				// Restaurer les valeurs selon la mémoire
				for(iCmpt=0;iCmpt<spanChilds.length;iCmpt++){
					switch(iCmpt){
						case 0: spanChilds[0].innerHTML = gblEntites[typeEntite][idEntite]['titre']; break;
						case 1: spanChilds[1].innerHTML = gblEntites[typeEntite][idEntite]['contenu']; break;
						case 2: spanChilds[2].innerHTML = gblEntites[typeEntite][idEntite]['note']; break;
					}
				}
			}
			gblEntiteEnCoursEdition = -1;
		}else{ // BOUTON "SAUVEGARDER"
			typeEntite = $("#"+balises_entites_base+">ul .active a").text();
			typeEntite = typeEntite.toLowerCase();
			typeEntite = typeEntite.replace('ù', 'u');
			typeEntite = typeEntite.replace('é', 'e');
			spanChilds = $(this).parents('.aide-memoire').find("span");
			//idEntite = 999; // on ne connais pas le ID réel maintenant
			gblEntites['temp'] = new Array();
			gblEntites['temp']['titre'] = spanChilds[0].innerHTML;
			gblEntites['temp']['contenu'] = spanChilds[1].innerHTML;
			gblEntites['temp']['note'] = spanChilds[2].innerHTML;
			gblEntites['temp']['typeEntite'] = typeEntite;
			//gblEntites['temp']['idEntite'] = idEntite;
			console.log(gblEntites['temp']);
			console.log(typeEntite);

			//if($(this).parents('.aide-memoire').data('idself') == 0){
			if(idEntite == 0){
				// si idself=0 alors insérer
				insererEntite(insererEntiteRetour, traiterErreurs, idRoman, typeEntite, gblEntites['temp']['titre'], gblEntites['temp']['contenu'], gblEntites['temp']['note']);
			}else{
				// sinon mise à jour
				console.log(idEntite);
				modifierEntite(MaJ_EntiteRetour, traiterErreurs, idRoman, typeEntite, gblEntites['temp']['titre'], gblEntites['temp']['contenu'], gblEntites['temp']['note'], idEntite);
				console.log(idEntite);
			}
		}
		//gblEntiteEnCoursEdition = -1;
	});


	//$(""#"+balises_entites_base .aide-memoire-toolbar>img:first-of-type").click(function(){
	//$("#"+balises_entites_base).on('click', '.aide-memoire-toolbar>img:first-of-type', function(){
	$("#"+balises_entites_base).on('click', '.aide-memoire-toolbar .glyphicon-list', function(){
		console.log("click -- dragNdrop");
	});

	$("#"+balises_entites_base).on('click', '.aide-memoire-toolbar .glyphicon-pencil', function(){
		/*
			Ajout d'une entitée
		*/
		console.log("click -- ajouter");
		var contenu = '';
		// Vérifie s'il y as ou non une entitée en édition ou si c'est une nouvelle entitée
		if(gblEntiteEnCoursEdition == -1){
			console.log("je crée un enfant!");
			contenu = construireCodeEntite(0);
			$("#"+balises_entites_base+">div").append(contenu);
			gblEntiteEnCoursEdition = 0;
		}else if(gblEntiteEnCoursEdition == 0){
		//if($("#"+balises_entites_base+">div>div:last-child").data("idself") == 0){
			alert("Erreur!\n\nUne nouvelle entitée est déjà en mode édition!");
			console.log("nouvel enfant déjà en édition!");
		}else{
			alert("Erreur!\n\nUne entitée est déjà en mode édition");
			console.log("Un enfant déjà en édition!");
		}
	});

	$("#"+balises_entites_base).on('click', '.aide-memoire-headings>img:first-of-type', function(){
		/*
			Éditer l'entitée
		*/
		console.log("click -- editer");
		//if($(this).parents('.aide-memoire').data('idself') == 0){
		//if($(this).parent().children('span').attr('contenteditable') == "true"){
		//console.log($("#"+balises_entites_base+">div").find("span[contenteditable='true']").length);
		//if($("#"+balises_entites_base).find("span").attr('contenteditable') == "true"){
		//if($("#"+balises_entites_base+">div").find("span[contenteditable='true']").length){
		if(gblEntiteEnCoursEdition == $(this).parents('.aide-memoire').data('idself')){
			console.log("CET enfant est déjà en mode édition!");
			alert("Erreur!\n\nCette entitée est déjà en mode édition!");
		}else if(gblEntiteEnCoursEdition > -1){
			console.log("un enfant est déjà en mode édition!");
			alert("Erreur!\n\nUne entitée est déjà en mode édition!");
		}else{
			$(this).parents(".aide-memoire").find("span").attr("contenteditable", "true");
			gblEntiteEnCoursEdition = $(this).parents(".aide-memoire").data("idself");
		}
	});

	$("#"+balises_entites_base).on('click', '.aide-memoire-headings>img:nth-of-type(2)', function(){
		/*
			Effacer l'entitée
		*/
		var typeEntite;
		var etatDeleted = true;
		var bProceder = false;

		if(gblEntiteEnCoursEdition == -1){
			bProceder = confirm("Attention!\n\nVous êtes sur le point d'effacer cette entitée!\n\nContinuer?");
			console.log("bProceder = "+bProceder);

			if(bProceder){
				gblEntiteEnCoursEdition = $(this).parents(".aide-memoire").data("idself");
				console.log("click -- effacer (" + gblEntiteEnCoursEdition +")");
				//manque code pour faire l'effacement

				typeEntite = $("#"+balises_entites_base+">ul .active a").text();
				typeEntite = typeEntite.toLowerCase();
				typeEntite = typeEntite.replace('ù', 'u');
				typeEntite = typeEntite.replace('é', 'e');
				gblEntites['temp'] = new Array();
				gblEntites['temp']['typeEntite'] = typeEntite;

				effacerEntite(effacerEntiteRetour, traiterErreurs, idRoman, gblEntiteEnCoursEdition, etatDeleted);
			}
		}else if(gblEntiteEnCoursEdition == $(this).parents('.aide-memoire').data('idself')){
			alert("Erreur!\n\nVeuillez annuler l'édition de cette entitée avant de lancer une autre opération!");
		}else{
			alert("Erreur!\n\nVeuillez terminer l'édition de l'entitée en cours avant de lancer une autre opération!");
		}
	});

	/*$("#"+balises_entites_base).on('dblclick', 'div.aide-memoire', function(){
		console.log("aide-memoire :: click! ("+$(this).data("idself")+")");
		if($(this).data("idself") !== 0){
			$(this).find("span").attr("contenteditable", "true");
		}else{
			alert("Vous ne pouvez pas éditer cette entitée.");
		}
	});
	$("#"+balises_entites_base).on('blur', 'div.aide-memoire', function(){
		console.log("[aide-memoire] OnBlur!!");
		// comme l'event se déclenche même quand je clique un enfant, je dois trouver une autre solution ou comprendre comment comparer disons "target" avec les enfants et si c'en est pas un alors enlever les attr editable. Le fait que on veux mettre un bouton à mon sens ne change rien au fait que si on clique ailleurs, on devrait considérer l'édition finie!
	});*/

	/*$("#btn_save").click(function(){
		/ *
			Permet de forcer la sauvegarde du texte Principal -SI- le contenu as été modifié
		* /
		if($("#"+balise_MainText).data("dirtyBit") === true){
			clearTimeout(gbl_DelaiSauvegarde_TextePrincipal);
			sauvegarderTextePrincipal(balise_MainText);
			console.log("btn_save / DirtyBit :: True");
		}else{
			console.log("btn_save / DirtyBit :: False");
		}
	});

	$("#btn_moveEntite").click(function(){
		var typeEntite = "qui";
		var nvTypeEntite = "quoi"; // <-- optionnel, ici pour illustrer que c'est supporté, de pouvoir déplacer de type une entitée
		var idEntite = 11;
		var id_prev = 13;
		var id_next = 0;

		deplacerEntite(deplacerEntiteRetour <-- a creer!! , traiterErreurs, idRoman, typeEntite, idEntite, id_prev, id_next, nvTypeEntite);
	});

*/

	if(idRoman > 0){
		$("#balise_MainText").hide();
		chargerRoman(afficherRoman, traiterErreurs, idRoman);
		lireEntites(afficherEntites, traiterErreurs, idRoman, "qui");
	}else{
		window.location.replace(baseURL+"index.php");
	}
});


/**********************
	WRAPPERS
**********************/
function lireEntites(fctTraitementPositif, fctTraitementNegatif, idRoman, typeEntite){//, containerEntites){
	var XHR_Query = "oper=lire&typeEntite="+typeEntite+"&idRoman="+idRoman;//+"&target="+containerEntites;
	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}

function modifierEntite(fctTraitementPositif, fctTraitementNegatif, idRoman, typeEntite, titre, contenu, noteEntite, idEntite){
	var XHR_Query;
	
	titre = encodeURIComponent (titre);
	contenu = encodeURIComponent (contenu);
	noteEntite = encodeURIComponent (noteEntite);
	XHR_Query = "oper=ecrire&typeEntite="+typeEntite+"&idRoman="+idRoman+"&titre="+titre+"&contenu="+contenu+"&note="+noteEntite+"&idEntite="+idEntite;
	console.log(XHR_Query);
	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}

function insererEntite(fctTraitementPositif, fctTraitementNegatif, idRoman, typeEntite, titre, contenu, noteEntite){
	var XHR_Query;
	
	titre = encodeURIComponent (titre);
	contenu = encodeURIComponent (contenu);
	noteEntite = encodeURIComponent (noteEntite);
	XHR_Query = "oper=inserer&typeEntite="+typeEntite+"&idRoman="+idRoman+"&titre="+titre+"&contenu="+contenu+"&note="+noteEntite;
	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}

/*
function deplacerEntite(fctTraitementPositif, fctTraitementNegatif, idRoman, typeEntite, idEntite, id_prev, id_next){
	/ *
		nvTypeEntite : optionnel, si donné déplacera l'entité vers ce nouveau type
	* /
	var nvTypeEntite = (arguments[7])?arguments[7]:null; // dernier parametre, si pas là forcer "null"; facon JS de le faire! :: parametre/argument optionel :: http://www.openjs.com/articles/optional_function_arguments.php
	var XHR_Query ="oper=deplacer&typeEntite="+typeEntite+"&idRoman="+idRoman+"&prev="+id_prev+"&next="+id_next+"&idEntite="+idEntite;

	if(null !== nvTypeEntite){
		XHR_Query += "&nvTypeEntite="+nvTypeEntite
	}

	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}
*/

function effacerEntite(fctTraitementPositif, fctTraitementNegatif, idRoman, idEntite){
	var etatDeleted = (arguments[4] != undefined)?arguments[4]:1; // argument optionel
	var XHR_Query = "oper=effacer&idRoman="+idRoman+"&idEntite="+idEntite+"&etat="+etatDeleted;
	console.log(XHR_Query);
	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}

function chargerRoman(fctTraitementPositif, fctTraitementNegatif, idRoman){
	var XHR_Query = "oper=lire&typeEntite=textePrincipal&idRoman="+idRoman;
	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}

function sauvegarderTexte(fctTraitementPositif, fctTraitementNegatif, idRoman, nouveauTexte, nouvelleNote){
	// pour arguments[4], valeurs attendues soit "textePrincipal" ou "notesGlobales"
	var nouveauTexte = encodeURIComponent (nouveauTexte);
	//var entiteASauvegarder = (arguments[4] !== undefined)?arguments[4]:"textePrincipal";
	//var XHR_Query = "oper=ecrire&typeEntite="+entiteASauvegarder+"&idRoman="+idRoman+"&contenu="+nouveauTexte;
	var XHR_Query = "oper=ecrire&typeEntite=textePrincipal&idRoman="+idRoman+"&contenu="+nouveauTexte+"&notes="+nouvelleNote;
	execXHR_Request("../assets/xhr/mode_edition.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}


/*********************
	FONCTIONS GLOBALES
	=N/A=
*********************/
function TraiterClickOnglets_Entites(ceci){
	/*
		Pour les onglets des entitées, s'occupe de relier l'event click au code XHR
	*/
	var typeEntite;
	var posSpace;
	var bProceder = true; // si est TRUE, continuer avec le changement d'onglet
	//console.log('click');
	if(!ceci.hasClass("active") && !ceci.hasClass("dropdown")){
		if(gblEntiteEnCoursEdition != -1){
			bProceder = confirm("Attention!\n\nUne entitée est en cours d'édition, vous risquez de perdre des données!\n\nContinuer?");
			console.log("bProceder = "+bProceder);
			//return;
		}
		if(bProceder){
			gblEntiteEnCoursEdition = -1; // on force à "aucune entitée en mode édition"
			//ceci.parents(".col-md-4 ul").find(".active").removeClass("active");
			//ceci.parents("#maincontent>div:nth-child(2)>ul").find(".active").removeClass("active");
			ceci.parents("#"+balises_entites_base+">ul").find(".active").removeClass("active");
			ceci.addClass("active");
			typeEntite = ceci.text();
			posSpace = typeEntite.indexOf(" ");
			if(posSpace > 0){
				typeEntite = typeEntite.substring(0, posSpace);
			}
			console.log(typeEntite);
			//return;
			typeEntite = typeEntite.toLowerCase();
			typeEntite = typeEntite.replace('ù', 'u');
			typeEntite = typeEntite.replace('é', 'e');
			if(typeEntite == "delit") {
				// Si c'est le bouton "Délit", ignorer l'évènement
				return;
			}
			//if(gblEntites[typeEntite].length > 0){
			if(gblEntites[typeEntite] !== undefined){
				/*if(gblEntites[typeEntite][0]['first'] > 0){
					console.log(typeEntite + " as au moins 1 membre");
				}else{
					console.log(typeEntite + " as déjà été lu mais est vide!");
				}*/
				afficherEntites(gblEntites[typeEntite], false);
			}else{
				//console.log(typeEntite + " est vide");
				lireEntites(afficherEntites, traiterErreurs, idRoman, typeEntite);
			}
		}
	//}else{
	//	console.log("L'onglet est deja active");
	}
}


function construireCodeEntite(curIndex){
	/*
		Normalement cette fonction recoit 1 paramêtre qui doit être un array contenant les détails de l'entité pour laquelle les balises doivent être construites
	*/
	var donnees;
	var contenu = '';
	var editable = '';

	if(arguments[1] === undefined){
		donnees = {'titre':"Tapez votre titre ici", 'contenu':"Entrez votre texte ici", 'note':"Laisser une note"};
		curIndex = 0;
		editable = ' contenteditable="true"';
	}else{
		donnees= arguments[1];
	}
		contenu += '<div class="aide-memoire" data-idself="'+curIndex+'">';

		contenu += '	<div class="aide-memoire-headings"><span'+editable+'>'+donnees['titre']+'</span><img src="../assets/images/toolbars/contract2_pencil.png" alt="Éditer cette entitée" /><img src="../assets/images/toolbars/trash_can_add.png" alt="Effacer cette entitée" /></div>';

		contenu += '	<div class="aide-memoire-content">';
		contenu += '		<span'+editable+'>'+donnees['contenu']+'</span>';
		contenu += '	</div>';
		contenu += '	<div class="aide-memoire-notes">';
		contenu += '		<span'+editable+'>';
		if(donnees['note'] !== null){
			contenu += donnees['note'];
			}
		contenu += '</span>';
		contenu += '	</div>';
		contenu += '	<div class="aide-memoire-boutons-edition">';
		contenu += '		<button type="button" class="btn btn-success"  data-btntype="save"><span class="glyphicon glyphicon-ok"></span></button>';
		contenu += '		<button type="button" class="btn btn-danger" data-btntype="cancel"><span class="glyphicon glyphicon-remove"></span></button>';
		contenu += '	</div>';
		contenu += "</div>\n\n";

		//curIndex = donnees[curIndex]['ID_next'];
	return contenu;
}
/**********************
	FONCTIONS DE TRAITEMENT DES RETOURS POSITIFS
	(C'est à dire, quand la requête XHR s'est complètée correctement. Ici on réagit selon le
	type de la requête, que ce soit par un message de confirmation ou la manipulation des
	données de retour.)
**********************/

function insererEntiteRetour(donnees){
	var typeEntite = gblEntites['temp']['typeEntite'];
	//var enfant;

	console.log("[insererEntiteRetour] Retour = ' "+donnees+" '");
	//gblEntites[gblEntites['temp']['typeEntite']][donnees]['titre'] = gblEntites['temp']['titre'];
	gblEntites[typeEntite][donnees] = {'ID_prev':gblEntites[typeEntite][0]['last'], 'ID_next':'0','titre':gblEntites['temp']['titre'], 'contenu':gblEntites['temp']['contenu'], 'note':gblEntites['temp']['note']};
	//gblEntites['temp']['contenu'] = spanChilds[1].innerHTML;
	//gblEntites['temp']['note'] = spanChilds[2].innerHTML;
	//gblEntites[typeEntite][donnees]['ID_prev'] = gblEntites[typeEntite][0]['last'];
	//gblEntites[typeEntite][donnees]['ID_next'] = 0;
	gblEntites[typeEntite][gblEntites[typeEntite][0]['last']]['ID_next'] = donnees;
	gblEntites[typeEntite][0]['last'] = donnees;

	//$("#"+balises_entites_base+">div>div:last-child").data("idself", "-20");
	//console.log("idself = " + $("#"+balises_entites_base+">div>div:last-child").data("idself"));
	$("#"+balises_entites_base+">div>div:last-child").data("idself", donnees);
	//$("#"+balises_entites_base+">div>div:last-child").attr("data-idself", donnees+"");
	console.log("idself = " + $("#"+balises_entites_base+">div>div:last-child").data("idself"));
	//enfant = $("#"+balises_entites_base+">div").find("div[data-idself=0]");
	//$("#"+balises_entites_base+">div").find("div[data-idself='0']").data("idself") = donnees;
	//enfant.setAttribute("data-idself") = donnees;
	//enfant.data("idself", donnees);
	//console.log(gblEntites[typeEntite]);
	//console.log(gblEntites['temp']);
	$("#"+balises_entites_base+">div").find("span[contenteditable='true']").removeAttr("contenteditable");
	gblEntiteEnCoursEdition = -1;
}

function MaJ_EntiteRetour(donnees){
	var typeEntite = gblEntites['temp']['typeEntite'];
	//var idEntite = gblEntites['temp']['idEntite'];

	console.log("[MaJ_EntiteRetour] Retour = ' "+donnees+" '");
	gblEntites[typeEntite][gblEntiteEnCoursEdition]['titre'] = gblEntites['temp']['titre'];
	gblEntites[typeEntite][gblEntiteEnCoursEdition]['contenu'] = gblEntites['temp']['contenu'];
	gblEntites[typeEntite][gblEntiteEnCoursEdition]['note'] = gblEntites['temp']['note'];
	//gblEntites[typeEntite][donnees]['ID_prev'] = gblEntites[typeEntite][0]['last'];
	//gblEntites[typeEntite][donnees]['ID_next'] = 0;
	//gblEntites[typeEntite][gblEntites[typeEntite][0]['last']]['ID_next'] = donnees;
	//gblEntites[typeEntite][0]['last'] = donnees;

	//$("#"+balises_entites_base+">div>div:last-child").data("idself", donnees);
	//console.log("idself = " + $("#"+balises_entites_base+">div>div:last-child").data("idself"));

	console.log(gblEntites[typeEntite]);
	console.log(gblEntites['temp']);

	$("#"+balises_entites_base+">div").find("span[contenteditable='true']").removeAttr("contenteditable");
	gblEntiteEnCoursEdition = -1;
}


function effacerEntiteRetour(donnees){
	var typeEntite = gblEntites['temp']['typeEntite'];
	var ID_next;
	var ID_prev;

	console.log("[effacerEntiteRetour] Retour = ' "+donnees+" '");

	ID_next = gblEntites[typeEntite][gblEntiteEnCoursEdition]['ID_next'];
	ID_prev = gblEntites[typeEntite][gblEntiteEnCoursEdition]['ID_prev'];

	if(ID_prev > 0) { gblEntites[typeEntite][ID_prev]['ID_next'] = ID_next; }
	if(ID_next > 0) { gblEntites[typeEntite][ID_next]['ID_prev'] = ID_prev; }


	// Manque activer lignes pour BD (updates) et ici trouver/effacer interface
	$("#"+balises_entites_base+">div").find("div[data-idself='"+gblEntiteEnCoursEdition+"']").remove();

	gblEntiteEnCoursEdition = -1;
}

function afficherEntites(donnees){
	/*
		Affiche les entitées contenues dans "donnees"

		Fait principalement de la génération de balise et de la copie de contenu/propriétés à partir du tableau "donnees"

		donnees : les donnees à traiter
		s'il y as un second parametre : indique qu'il ne faut pas pré-traiter les données avec JSON
	*/
	//	Préparer les données
	//if(arguments[1] !== undefined){
	if(arguments[1] === undefined){
		donnees = JSON.parse(donnees); // contraire :: JSON.stringify(array);
		gblEntites[donnees[0]['typeEntite']] = donnees;
		//console.log("[afficherEntites] j'ai chargé les entites");
	}

	//console.log(donnees);
	var contenu='';
	var curIndex = donnees[0]['first'];
	//var typeEntite = donnees[0]['typeEntite'];
	//var baliseParent = "#"+balises_entites_base; //+typeEntite; //donnees[0]['target'];
	var entiteOnglet = $("#"+balises_entites_base).find("ul .active").text();

	//contenu += '<div class="aide-memoire-toolbar"><span class="toolbar-title">'+donnees[0]['typeEntite']+'</span><img src="../assets/images/toolbars/list.png" alt="drag and drop" /><img src="../assets/images/toolbars/pencil_add.png" /></div>';
	contenu += '<div class="aide-memoire-toolbar"><span class="toolbar-title">'+entiteOnglet+'</span><span class="glyphicon glyphicon-pencil"></span><span class="glyphicon glyphicon-minus"></span></div>';

	if(curIndex !== null){
		// 	Créer l'interface dans le parent donnees[0]['target']
		//$("#"+balises_entites_base).html('');
		do{
			contenu += construireCodeEntite(curIndex, donnees[curIndex]);
			curIndex = donnees[curIndex]['ID_next'];
		}while(curIndex != 0);

		//$(baliseParent).html(contenu);
		//$("#"+balises_entites_base).html(contenu);
	}else{
		console.log("[afficherEntites] Aucune entitée de ce type attachée à ce Roman!");
		//console.log(donnees);
		//gblEntites[donnees[0]['typeEntite']][0]['first'] = 0;
		//console.log(gblEntites);
		contenu += '<div class="aide-memoire" ';
		contenu += 'data-idself="0">';
		contenu += '	<div class="aide-memoire-headings"><span>Aucune entitées pour ce type.</span></div>';
		contenu += "</div>\n\n";
		//$("#"+balises_entites_base).html(contenu);
	}
	$("#"+balises_entites_base+">div").html(contenu);
}

function afficherRoman(donnees){
	//$("#balise_attendez").hide();
	gblRoman = JSON.parse(donnees); // contraire :: JSON.stringify(array);
	//console.log(gblRoman);
	if(gblRoman.length !== 0){
		$("#"+balise_MainText).text(gblRoman['contenu']);
		$("h2").text(gblRoman['titre']);
		
		// Lancer l'Interval qui s'occupe de sauvegarder les texte principal et notes à un certain délai
		//gbl_DelaiSauvegarde_TextePrincipal = setInterval(function(){sauvegarderTextePrincipal(balise_MainText);}, iFrequenceSauvegarde_TextePrincipal);
	}else{
		$("#"+balise_MainText).text("[Cet usager n'as aucun Roman ou il y as eût une erreur de BD.]");
	}
	$("#"+balise_MainText).show();
	$("#"+balise_MainText+"~p").hide();
}

function sauvegarderTextePrincipal(id_balise){
	/*
		Si le texte Principal as été modifié, alors il est sauvegardé.
		L'état de $("#"+balise_MainText).data("dirtyBit") en décide
	*/

	//$("#temoin_activite").css("background-color", ($("#temoin_activite").css("background-color") == "rgb(255, 255, 0)")?"blue":"yellow");

	//if($("#"+balise_MainText).data("dirtyBit") === true){
		if(DirtyBits['onglet'] == "textePrincipal"){
			gblRoman['contenu'] = $("#"+id_balise).val();
		}else{
			gblRoman['notes_globales'] = $("#"+id_balise).val();
		}
	
		//sauvegarderTexte(lancerDelaiSauvegardeTextePrincipal, traiterErreurs, idRoman, gblRoman['contenu'], 'textePrincipal');
		sauvegarderTexte(lancerDelaiSauvegardeTextePrincipal, traiterErreurs, idRoman, gblRoman['contenu'],  gblRoman['notes_globales']);
		//sauvegarderTexte(lancerDelaiSauvegardeTextePrincipal, traiterErreurs, idRoman, gblRoman['notes_globales'], 'notesGenerales');
		
		//console.log($("#"+id_balise).val());
		//console.log($("#"+id_balise).text());
	//	console.log("sauvegarderTextePrincipal("+id_balise+") / DirtyBit :: True");
	//}else{
		//gbl_DelaiSauvegarde_TextePrincipal = setTimeout('sauvegarderTextePrincipal("'+balise_MainText+'")', iFrequenceSauvegarde_TextePrincipal);
	//	console.log("sauvegarderTextePrincipal("+id_balise+") / DirtyBit :: False");
	//}
}

function lancerDelaiSauvegardeTextePrincipal(msgRetour){
	/*
		Lance un nouveau setTimeout à la fin duquel une tentative de sauvegarde sera faite
	*/
	/*$("#"+balise_MainText).data("dirtyBit", false);
	gbl_DelaiSauvegarde_TextePrincipal = setTimeout('sauvegarderTextePrincipal("'+balise_MainText+'")', iFrequenceSauvegarde_TextePrincipal);
	$("#temoin_activite").css("background-color", ($("#temoin_activite").css("background-color") == "rgb(255, 0, 0)")?"green":"red");*/
	console.log(msgRetour);
	//$("#msg_confirm_save").text("Texte sauvegardé @ " + Date.now()).show();
	//setTimeout(function(){ $("#msg_confirm_save").hide();}, iDelaiOcculterMessageSauvegarde);
	$("#msg_confirm_save").text("Texte sauvegardé @ " + Date.now()).fadeIn('medium').delay(iDelaiOcculterMessageSauvegarde).fadeOut('slow');
}




/**********************
	FONCTIONS DE TRAITEMENT DES RETOURS NÉGATIFS
**********************/
function traiterErreurs(msgErreur){
	/*
	Voir appels à "execXHR_Request",
	Sert à traiter l'erreur recue.
	Pour le moment l'erreur la plus commune devrais être "usager team_codeH inexistant"
	ce qui veux dire que l'on doit créer l'usager pour accèder à la BD (ne pas mélanger avec la table "usagers"
	parce que ce n'est pas du tout la même chose), voir le fichier db_access.inc.php pour le mot de passe
	*/

	if(msgErreur.substring(0,6) =="<br />"){ // Si commence par '<br />', on suppose que c'est une erreur PHP!
		msgErreur = "[PHP] " + strStripHTML(msgErreur);
	}

	alert("L'erreur suivante est survenue : '"+msgErreur+"'");
}

/*
	FONCTIONS NOMMÉES DANS LA BD

	== N/A ==
*/


/* == EOF == */
