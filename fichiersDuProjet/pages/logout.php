<?php
session_start();

unset($_SESSION['pseudo']);

header("Location:/fichiersDuProjet/index.php");
exit();