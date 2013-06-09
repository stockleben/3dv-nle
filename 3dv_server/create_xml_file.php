<?php
header('Content-Type: text/xml; charset=utf-8');

define("STANDARD_FILENAME","res/tracedata.xml");

$data = $_POST['data'];
//$xml = new SimpleXMLElement($data);
//$xml->asXML();
file_put_contents(STANDARD_FILENAME,$data);

?>