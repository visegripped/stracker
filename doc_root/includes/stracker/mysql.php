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

function tableExists($tableId, $db) {
  $query = "SHOW TABLES LIKE '".$tableId."'";
  $is_table=$db->query($query);
   return $is_table->rowCount();
}


function createSymbolTable($symbol, $db) {
  $statement = "CREATE TABLE $symbol(
    EOD decimal(10,2) NOT NULL,
    MA20 decimal(10,2) NULL,
    MA50 decimal(10,2) NULL,
    delta decimal(10,2) NULL,
    deltaMA5 decimal(10,2) NULL,
    deltaMA10 decimal(10,2) NULL,
    deltaMA20 decimal(10,2) NULL,
    P0 tinyint NOT NULL,
    P1 tinyint NOT NULL,
    P2 tinyint NOT NULL,
    M1 decimal(10,2) NULL,
    M2 decimal(10,2) NULL,
    M3 decimal(10,2) NULL,
    date date NOT NULL,
    PRIMARY KEY (date)
  )";
  $db->exec($statement);
}

?>