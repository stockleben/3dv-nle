<?php
header('Content-Type: text/xml; charset=utf-8');

define("STANDARD_FILENAME","tmp/tracedata.xml");

if (get_magic_quotes_gpc()){
	$data = stripslashes($_POST['data']);
} else {
	$data = $_POST['data'];
}
//$xml = new SimpleXMLElement($data);
//$xml->asXML();

file_put_contents(STANDARD_FILENAME,$data);

?>