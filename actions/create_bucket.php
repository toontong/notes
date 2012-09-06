<?php
$bucket = isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$acl = isset($_POST['acl']) ? $_POST['acl'] : $_GET['acl'];

if(!$bucket) {
    header("HTTP/1.1 400 Bad Request");
    exit();
}
if (!$acl) {
    $acl = ALIOSS::OSS_ACL_TYPE_PRIVATE;
    //$acl = ALIOSS::OSS_ACL_TYPE_PUBLIC_READ;
    //$acl = ALIOSS::OSS_ACL_TYPE_PUBLIC_READ_WRITE;
}

require_once 'public.php';

$oss_sdk_service = get_oss_instance();

$response = $oss_sdk_service->create_bucket($bucket, $acl);

output_result($response);

?>