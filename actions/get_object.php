<?php

$bucket = isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
 
if(!$bucket && !$object) {
    header("HTTP/1.1 400 Bad Request");
    exit();
}

require_once 'public.php';

$oss_sdk_service = get_oss_instance();
   
$options = array(
    ALIOSS::OSS_CONTENT_TYPE => 'application/octet-stream',
);  
    
$response = $oss_sdk_service->get_object($bucket,$object,$options);

if($response->status / 100 == 2){
    header("HTTP/1.1 200 OK");
    header($response->header["etag"]);
    header($response->header["content-length"]);
    header($response->header["content-type"]);
    header($response->header["last-modified"]);
 
} else if ($response->status== 403){
    header("HTTP/1.1 403 Forbidden");
} else{
    header("HTTP/1.1 404 Not Found"); 
}
echo $res['body'] = $response->body;

//echo $res['body'] = $response->body;
    
?>