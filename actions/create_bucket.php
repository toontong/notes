<?php

require_once 'public.php';

if(MULTI_USER_SUPPORT){
    //安全控制：多用户版不允许调用
    header("HTTP/1.0 404 Not Found"); 
    echo "404 Not Found";
    exit();
}

$bucket = isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$acl = isset($_POST['acl']) ? $_POST['acl'] : $_GET['acl'];

if(!$bucket) {
    exit_on(400);
}
if (!$acl) {
    $acl = ALIOSS::OSS_ACL_TYPE_PRIVATE;
    //$acl = ALIOSS::OSS_ACL_TYPE_PUBLIC_READ;
    //$acl = ALIOSS::OSS_ACL_TYPE_PUBLIC_READ_WRITE;
}

$oss_sdk_service = get_oss_instance();

$response = $oss_sdk_service->create_bucket($bucket, $acl);

output_result($response);

?>