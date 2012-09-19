<?php

require_once 'public.php';

$bucket = MULTI_USER_SUPPORT ? NOTES_BUCKET : (isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket']);
$prefix = isset($_POST['prefix']) ? $_POST['prefix'] : $_GET['prefix'];
$marker = isset($_POST['marker']) ? $_POST['marker'] : $_GET['marker'];

if(!$bucket && !$prefix) {
     exit_on(400);
}

$oss_sdk_service = get_oss_instance();
if(MULTI_USER_SUPPORT && strstr($prefix, $_SESSION['username']) !== $prefix){
    exit_on(401);
}

$options = array(
    'delimiter' => '/',
    'prefix' => $prefix ,
    'max-keys' => 10,
    'marker' => $marker,
);
$response = $oss_sdk_service->list_object($bucket, $options);

output_result($response);

?>