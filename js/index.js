"use strict";

/**********************
	EVENT HANDLERS
**********************/
$(function(){
	$("#form_login").submit(function(){
		/*
			Validation par HTML5 : On doit attrapper l'évènement SUBMIT directement sur le FORM parce que si on agit sur le CLICK d'un bouton et que le FORM n'est pas valide selon le BROWSER, la fonction du bouton est appellée malgré tout.
		*/
		verifierUsager(authentifierUsager, erreurAuthentification, $("#loginName").val(), $("#loginPwd").val());
		return false;
	});

	$("#registerNick").keyup(function(){
		verifierUsager(NomUsagerPris, NomUsagerLibre, $("#registerNick").val());
	});

	$("#form_register").submit(function(){
		/*
			Validation par HTML5 : On doit attrapper l'évènement SUBMIT directement
			sur le FORM parce que si on agit sur le CLICK d'un bouton et que le FORM
			n'est pas valide selon le BROWSER, la fonction du bouton est appellée
			malgré tout.
		*/
		if ($("#registerNick").data("nomLibre") == "true"){
			if($("#registerPwd").val() != $("#registerPwdConf").val()){
				$("#form_register>div>span").text("Les mots de passe ne correspondent pas.");
				$("#form_register>div>span").css({color:"#f00"});
				$("#form_register>div").css({"background-color":"#fcc", border:"3px inset #f00", padding:"10px", "margin-bottom":"10px"});
			}else{
				insererUsager(authentifierUsager, traiterErreurs, $("#registerNick").val(), $("#registerPwd").val(), $("#registerName").val());
			}
		}else{
			$("#form_register>div>span").text("Le nom n'est pas libre!");
			$("#form_register>div>span").css({color:"#f00"});
			$("#form_register>div").css({"background-color":"#fcc", border:"3px inset #f00", padding:"10px", "margin-bottom":"10px"});
		}

		return false;
	});
});


/**********************
	WRAPPERS
**********************/
function verifierUsager(fctTraitementPositif, fctTraitementNegatif, pseudo){
	/*
		Lance la requête pour vérifier si pseudo/motdepasse est une bonne combinaison
	*/
	var XHR_Query = "oper=lire&usager="+pseudo;
	if(arguments[3] != undefined){
		XHR_Query += "&pwd="+arguments[3];
	}

	execXHR_Request("xhr/index.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}

function insererUsager(fctTraitementPositif, fctTraitementNegatif, pseudo, motDePasse, nomUsager){
	/*
		Lance la requête pour vérifier si pseudo/motdepasse est une bonne combinaison
	*/
	var XHR_Query = "oper=inserer&usager="+pseudo+"&pwd="+motDePasse;
	if(nomUsager.length>0){
		XHR_Query += "&nomUsager="+nomUsager;
	}

	execXHR_Request("xhr/index.xhr.php", XHR_Query, fctTraitementPositif, fctTraitementNegatif);
}


/*********************
	FONCTIONS DE TRAITEMENT DES RETOURS POSITIFS
	(C'est à dire, quand la requête XHR s'est complètée correctement. Ici on réagit selon le type de la requête, que ce soit par un message de confirmation ou la manipulation des données de retour.)
*********************/
function authentifierUsager(){
	/*
		La vraie authentification est faite par PHP et le retour de la fonction dit à XHR d'appeller celle-ci pour conclure la procédure
	*/
	window.location.replace(baseURL+"hub_client.php");
}

function NomUsagerLibre(){
	$("#form_register>div>span").text("Le nom est libre.");
	$("#form_register>div>span").css({color:"#0f0"});
	$("#form_register>div").css({"background-color":"#cfc", border:"3px inset #0f0", padding:"10px", "margin-bottom":"10px"});
	$("#registerNick").data("nomLibre", "true");
}

/**********************
	FONCTIONS DE TRAITEMENT DES RETOURS NÉGATIFS
**********************/
function traiterErreurs(msgErreur){
	/*
		Voir appels à "execXHR_Request",
		Sert à traiter l'erreur recue.
	*/

	if(msgErreur.substring(0,6) =="<br />"){ // Si commence par '<br />', on suppose que c'est une erreur PHP!
		msgErreur = "[PHP] " + strStripHTML(msgErreur);
	}

	alert("L'erreur suivante est survenue : '"+msgErreur+"'");
}

function erreurAuthentification(msgErreur){
	/*
		Voir appels à "execXHR_Request",
		Sert à traiter l'erreur recue.
	*/
	$("#form_login>div>span").text("Pseudo ou Mot de passe erroné.");
	$("#form_login>div>span").css({color:"#f00"});
	$("#form_login>div").css({"background-color":"#fcc", border:"3px inset #f00", padding:"10px", "margin-bottom":"10px"});
}

function NomUsagerPris(){
	$("#form_register>div>span").text("Le nom n'est pas libre.");
	$("#form_register>div>span").css({color:"#f00"});
	$("#form_register>div").css({"background-color":"#fcc", border:"3px inset #f00", padding:"10px", "margin-bottom":"10px"});
	$("#registerNick").data("nomLibre", "false");
}

/* == EOF == */
