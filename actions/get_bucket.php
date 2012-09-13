<?php
$bucket = isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$prefix = isset($_POST['prefix']) ? $_POST['prefix'] : $_GET['prefix'];
$marker = isset($_POST['marker']) ? $_POST['marker'] : $_GET['marker'];
 
if(!$bucket && !$prefix) {
    header("HTTP/1.1 400 Bad Request");
    exit();
}

require_once 'public.php';

$oss_sdk_service = get_oss_instance();
$options = array(
    'delimiter' => '/',
    'prefix' => $prefix ,
    'max-keys' => 11,
    'marker' => $marker,
);
$response = $oss_sdk_service->list_object($bucket, $options);

output_result($response);

?>