<?php
 
require_once 'public.php';

$bucket = MULTI_USER_SUPPORT ? NOTES_BUCKET : (isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket']);
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];

if(!$bucket && !$object) {
    exit_on(400);
}

$oss_sdk_service = get_oss_instance();

if(MULTI_USER_SUPPORT && strstr($object, $_SESSION['username']) !== $object){
    exit_on(401);
}


$response = $oss_sdk_service->get_object_meta($bucket, $object);

output_result($response);
    
?>