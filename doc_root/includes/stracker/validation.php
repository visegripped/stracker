<?php

function isValidSymbol($symbol) {
  if(!$symbol) {
    return false;
  }
  if(mb_strlen($symbol) > 8) {
    return false;
  }
  if(!ctype_alpha($symbol)) {
    return false;
  }
  return true;
}

function isValidDate($date) {
  if(!$date) {
    return false;
  }
  if(mb_strlen($date) > 8) {
    return false;
  }
  if(!ctype_digit($date)) {
    return false;
  }
  return true;
}

function areValidDates($date1, $date2) {
  if(isValidDate($date1) & isValidDate($date2)) {
    return true;
  }
  return false;
}

?>