<?php
 
require_once 'public.php';

$bucket = NOTES_BUCKET; //isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];

if(!$bucket && !$object) {
    exit_on(400);
}

$oss_sdk_service = get_oss_instance();
if(strstr($object, $_SESSION['username']) !== $object){
    exit_on(403);
}
   
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

echo $response->body;
  
?>