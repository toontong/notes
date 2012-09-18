<?php

require_once 'public.php';

$bucket = NOTES_BUCKET; //isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket'];
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
$content = $_POST['content']; // 必需post 过来 ，可以为空
$title = isset($_POST['title']) ? $_POST['title'] : $_GET['title'];
$disposition = isset($_POST['disposition']) ? $_POST['disposition'] : $_GET['disposition'];

if(!$bucket && !$object && !$title) {
    exit_on();
}

$oss_sdk_service = get_oss_instance();
if(strstr($object, $_SESSION['username']) !== $object){
    exit_on(403);
}

$upload_file_options = array(
    'content' => $content,
    'length' => strlen($content),
    ALIOSS::OSS_HEADERS => array(
        "x-oss-meta-title" => $title,
        "x-oss-meta-disposition"=>$disposition,
        "Content-Disposition" => 'aliyun.notes.app.by.toontong',
        "Content-Encoding"=>"utf-8",
    ),
);

$response = $oss_sdk_service->upload_file_by_content($bucket, $object, $upload_file_options);

output_result($response);

?>