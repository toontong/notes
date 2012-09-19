<?php

require_once 'public.php';
// 安全控制，多用户版本不能调用
if(MULTI_USER_SUPPORT){
    header("HTTP/1.0 404 Not Found"); 
    echo "404 Not Found";
    exit();
}

$oss_sdk_service = get_oss_instance();

$response = $oss_sdk_service->list_bucket();

output_result($response);

?>