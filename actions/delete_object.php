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
    'quiet' => false,
);

$response = $oss_sdk_service->delete_objects($bucket,$objects,$options);

output_result($response);

?>