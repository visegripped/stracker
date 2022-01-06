<?php
include 'mysql.php';
include 'passwords.php';

$dbh = dbConnect();


echo 'Step 1: create the database and user, with priveleges.'
$dbh - > exec("CREATE DATABASE "$dbname";
      CREATE USER '$dbusername' @ '$dbhost'
      IDENTIFIED BY '$dbpassword'; GRANT ALL ON "$dbname".*TO '$dbusername'
      @ '$dbhost'; FLUSH PRIVILEGES;
      ");
      or die(print_r($dbh - > errorInfo(), true));
      echo " -> $dbname database created successfully.";
      echo " -> $dbusername user created successfully.";

echo 'Step 2: create the symbols table.'

// SQL statement for creating new tables
$statements = [
	'CREATE TABLE _symbols( 
        symbol  VARCHAR(5) NOT NULL, 
        name TINYTEXT() NULL, 
        PRIMARY KEY(symbol)
    );'];

// execute SQL statements
foreach ($statements as $statement) {
	$dbh->exec($statement);
    or die(print_r($dbh - > errorInfo(), true));
}



CREATE TABLE "_users" (
    "id" int(11) NOT NULL AUTO_INCREMENT,
    "oauth_provider" enum('facebook','google','twitter','')  NOT NULL DEFAULT '',
    "oauth_uid" varchar(50)  NOT NULL,
    "first_name" varchar(25)  NOT NULL,
    "email" varchar(50)  NOT NULL,
    "created" datetime NOT NULL,
    "modified" datetime NOT NULL,
    PRIMARY KEY ("id")
   ) 
   

?>