<?php
$bucket = isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
$to_bucket = isset($_POST['to_bucket']) ? $_POST['to_bucket'] : $_GET['to_bucket'];
$to_object = isset($_POST['to_object']) ? $_POST['to_object'] : $_GET['to_object'];
 
if(!$bucket && !$object && !$to_object && !$to_bucket) {
    header("HTTP/1.1 400 Bad Request");
    exit();
}

require_once 'public.php';

$oss_sdk_service = get_oss_instance();

$response = $oss_sdk_service->copy_object($bucket, $object, $to_bucket, $to_object);

output_result($response); 

$options = array(
    'quiet' => false,
);

// 不s结束的，是单个删除
$response = $oss_sdk_service->delete_object($bucket, $object, $options);

?>