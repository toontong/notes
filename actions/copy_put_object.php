<?php

require_once 'public.php';

$bucket = MULTI_USER_SUPPORT ? NOTES_BUCKET : (isset($_POST['bucket']) ? $_POST['bucket'] : $_GET['bucket']);
$object = isset($_POST['object']) ? $_POST['object'] : $_GET['object'];
$title = isset($_POST['title']) ? $_POST['title'] : $_GET['title'];
$content = $_POST['content']; // 必需post 过来 ，可以为空
$history = isset($_POST['history']) ? $_POST['history'] : $_GET['history'];
$disposition = isset($_POST['disposition']) ? $_POST['disposition'] : $_GET['disposition'];

$oss_sdk_service = get_oss_instance();

if(MULTI_USER_SUPPORT && strstr($object, $_SESSION['username']) !== $object){
    exit_on(401);
}

if(!$object && !$title) {
    exit_on(400);
}

function microtime_float()
{ // --> foramt like: 1347344878.1323
    list($usec, $sec) = explode(" ", microtime());
    return ((float)$usec + (float)$sec);
}

$copy_to = microtime_float();
$to_object = MULTI_USER_SUPPORT ? NOTES_HISTORY_PREFIX . $copy_to : $_SESSION['username'] . NOTES_HISTORY_PREFIX . $copy_to;
$arr_history = $history ? explode(";", ltrim($history, ";")) : array();

if(count($arr_history) >= MAX_HISTORY_COPY){
    $options = array('quiet' => false);
    // 不s结束的，是单个删除
    $response = $oss_sdk_service->delete_object($bucket, array_shift($arr_history), $options);
}

$response = $oss_sdk_service->copy_object($bucket, $object, $bucket, $to_object);

if( $response->status / 100 != 2){
    // copy not success.
    output_result($response);
}

array_push($arr_history, $copy_to);
$history = implode(";", $arr_history);

$upload_file_options = array(
    'content' => $content,
    'length' => strlen($content),
    ALIOSS::OSS_HEADERS => array(
        "x-oss-meta-title" => $title,
        "x-oss-meta-disposition"=> $disposition,
        "x-oss-meta-history"=> $history,
        "Content-Disposition" => 'aliyun.notes.app.by.toontong',
        "Content-Encoding"=>"utf-8",
    ),
);

$response = $oss_sdk_service->upload_file_by_content($bucket, $object, $upload_file_options);
$response->header["x-oss-meta-history"] = $history;

output_result($response);

?>