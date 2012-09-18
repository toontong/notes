<?php
require_once 'public.php';

$bucket = NOTES_BUCKET; //isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
$history = isset($_POST['history']) ? $_POST['history'] : $_GET['history'];

if(!$bucket && !$object) {
    exit_on(400);
}

$oss_sdk_service = get_oss_instance();
if(strstr($object, $_SESSION['username']) !== $object){
    exit_on(403);
}

$arr_objects = $history ? explode(";", ltrim($history, ";")) : array();

array_push($arr_objects, $object);

$options = array(
    'quiet' => false,
);

// 删除多个
$response = $oss_sdk_service->delete_objects($bucket, $arr_objects, $options);

output_result($response);

?>