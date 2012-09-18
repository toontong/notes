<?php

require_once 'public.php';

$username = isset($_POST['username']) ? $_POST['username'] : $_GET['username'];
$password_hash = isset($_POST['password_hash']) ? $_POST['password_hash'] : $_GET['password_hash'];

$res = array("status" => 200);

if (!$username || !$password_hash)
{
    exit_on(400);
}

if(substr($username, -1) !== '/')
    $username = $username . '/';

$bucket = "notes_bucket";

session_start();
$_SESSION['username'] = $username;

$oss_sdk_service = get_oss_instance();

$response = $oss_sdk_service->get_object_meta($bucket, $username);

if($response->status == 404){
    // username not exist, will create it.
    $_SESSION['bucket'] = $bucket;
} elseif ($response->status === 200){
    // username exist
    $res['status'] = 404;
    $res["body"] = "Username Exist";
    session_destroy();
    echo json_encode($res);
    exit();
} else {
    output_result($response);
}

$content  = $username . '#'. $password_hash;
$upload_file_options = array(
    'content' => $content,
    'length' => strlen($content),
    ALIOSS::OSS_HEADERS => array(
        "x-oss-meta-title" => $username,
        "x-oss-meta-disposition"=>"the user register folder, save the user information.",
        "x-oss-meta-password-hash"=> $password_hash,
        "Content-Disposition" => 'aliyun.notes.app.by.toontong',
        "Content-Encoding"=>"utf-8",
    ),
);

$response = $oss_sdk_service->upload_file_by_content($bucket, $username, $upload_file_options);

$_SESSION['user'] = $username;
output_result($response);
?>