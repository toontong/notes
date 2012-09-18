<?php
// 安全控制，多用户版本不能调用
exit(); 

require_once 'public.php';

$oss_sdk_service = get_oss_instance();

$response = $oss_sdk_service->list_bucket();

output_result($response);

?>