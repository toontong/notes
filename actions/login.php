<?php
require_once 'public.php';

function get_object_list($oss_sdk, $prefix){
    $options = array(
        'delimiter' => '/',
        'prefix' => $prefix . NOTES_FOLDER_PREFIX,
        'max-keys' => 11,
        'marker' => "",
    );
    return $oss_sdk->list_object(NOTES_BUCKET, $options);
}

$username = isset($_POST['username']) ? $_POST['username'] : $_GET['username'];
$password_hash = isset($_POST['password_hash']) ? $_POST['password_hash'] : $_GET['password_hash'];

$res = array();
$res['status'] = 200;
session_start();
if($username && $password_hash)
{
    if(substr($username, -1) !== '/')
        $username = $username . '/';
    
    $_SESSION['username'] = $username;
    $oss_sdk_service = get_oss_instance();
    $response = $oss_sdk_service->get_object_meta(NOTES_BUCKET, $username);
    if($response->status != 200){
        session_destroy();
        exit_on($response->status);
    } elseif ($response->header["x-oss-meta-password-hash"] !== $password_hash) {
        exit_on(405);
    }
    $resp = get_object_list($oss_sdk_service, $username);
    output_result2($resp, array('user' => rtrim($_SESSION['username'], '/')));

} else if (isset($_SESSION['username'])) {
    $resp = get_object_list(get_oss_instance(), $_SESSION['username']);
    output_result2($resp, array('user' => rtrim($_SESSION['username'], '/')));
} else {
    exit_on(403);
}

?>