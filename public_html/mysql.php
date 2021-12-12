<?php
function dbConnect() {
    include 'passwords.php';
      define("DB_HOST", $dbhost);
      define("DB_NAME", $dbname);
      define("DB_CHARSET", "utf8");
      define("DB_USER", $dbusername);
      define("DB_PASSWORD", $dbpassword);
      
      
      try {
        $dbh = new PDO(
          "mysql:host=". DB_HOST .";dbname=". DB_NAME .";charset=". DB_CHARSET,
          DB_USER, DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
          ]
        );
        return $dbh;
      } catch (Exception $ex) { exit($ex->getMessage()); }
}



// (C) SELECT USERS
// $stmt = $pdo->prepare("SELECT * FROM `users`");
// $stmt->execute();
// while ($row = $stmt->fetch()) { print_r($row); }
// if ($stmt !== null) { $stmt = null; }
// if ($pdo !== null) { $pdo = null; }

// // (TEST) TOTAL TIME TAKEN
// $taken = microtime(true) - $taken;



// CREATE TABLE `INTU` (
//   `eodp` decimal(10,2) NOT NULL,
//   `ma20` decimal(10,2) NOT NULL,
//   `ma50` decimal(10,2) NOT NULL,
//   `delta` decimal(10,2) NOT NULL,
//   `deltaMA5` decimal(10,2) NOT NULL,
//   `deltaMA10` decimal(10,2) NOT NULL,
//   `deltaMA20` decimal(10,2) NOT NULL,
//   `P0` tinyint NOT NULL,
//   `P1` tinyint NOT NULL,
//   `P2` tinyint NOT NULL,
//   `M1` decimal(10,2) NOT NULL,
//   `M2` decimal(10,2) NOT NULL,
//   `M3` decimal(10,2) NOT NULL,
//   `date` date NOT NULL,
//   PRIMARY KEY (`date`)
// ) 

// https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3rO63DKTu9lmgHNKxWEYZ-sGoeG7LS6sJ9s38rOvoReHbmkxliThJB7FDQzZsl7_Cb0bF8hhHP01Q/pubhtml

?>