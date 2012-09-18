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
    'quiet' => false,
);

// 不s结束的，是单个删除
$response = $oss_sdk_service->delete_object($bucket, $object, $options);

output_result($response);

?>