<?php
 
require_once 'public.php';

$bucket = MULTI_USER_SUPPORT ? NOTES_BUCKET : (isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket']);
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
$to_bucket = MULTI_USER_SUPPORT ? NOTES_BUCKET : (isset($_POST['to_bucket']) ? $_POST['to_bucket'] : $_GET['to_bucket']);
$to_object = isset($_POST['to_object']) ? $_POST['to_object'] : $_GET['to_object'];

if(!$bucket && !$object && !$to_object && !$to_bucket) {
    exit_on(400);
}

$oss_sdk_service = get_oss_instance();

if(MULTI_USER_SUPPORT && strstr($object, $_SESSION['username']) !== $object && strstr($to_object, $_SESSION['username']) !== $to_object){
    exit_on(401);
}

$response = $oss_sdk_service->copy_object($bucket, $object, $to_bucket, $to_object);

output_result($response); 

$options = array(
    'quiet' => false,
);

// 不s结束的，是单个删除
$response = $oss_sdk_service->delete_object($bucket, $object, $options);

?>