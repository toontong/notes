<?php

require_once 'public.php';

$oss_sdk_service = get_oss_instance();
//var_dump($oss_sdk_service);
//exit();

$response = $oss_sdk_service->list_bucket();

output_result($response);

?>