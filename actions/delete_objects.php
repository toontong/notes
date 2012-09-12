<?php
$bucket = isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
$history = isset($_POST['history']) ? $_POST['history'] : $_GET['history'];
 
if(!$bucket && !$object) {
    header("HTTP/1.1 400 Bad Request");
    exit();
}

require_once 'public.php';

$oss_sdk_service = get_oss_instance();
$arr_objects = $history ? explode(";", ltrim($history, ";")) : array();

array_push($arr_objects, $object);

$options = array(
    'quiet' => false,
);

// 删除多个
$response = $oss_sdk_service->delete_objects($bucket, $arr_objects, $options);

output_result($response);

?>