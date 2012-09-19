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

if(!MULTI_USER_SUPPORT) {
    // 单用户版本，使用access_key, access_id登录
    $access_key = isset($_POST['access_key']) ? $_POST['access_key'] : $_GET['access_key'];
    $access_id = isset($_POST['access_id']) ? $_POST['access_id'] : $_GET['access_id'];
    $host = isset($_POST['host']) ? $_POST['host'] : $_GET['host'];

    if(!$host) $host = 'storage.aliyun.com';

    if (!$access_key || !$access_id){
        if(!isset($_SESSION['access_key']) && !isset($_SESSION['access_id']) && !isset($_SESSION['host'])){
            exit_on(401);
        } else {
            require_once 'get_service.php';
            exit();
        }
    }

    $_SESSION['host'] = $host;
    $_SESSION['access_id'] = $access_id; 
    $_SESSION['access_key']  = $access_key;

    require_once 'get_service.php';
    exit();
}

// 以下为多用户版本
$username = isset($_POST['username']) ? $_POST['username'] : $_GET['username'];
$password_hash = isset($_POST['password_hash']) ? $_POST['password_hash'] : $_GET['password_hash'];

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
    require_once 'public.php';
    $resp = get_object_list(get_oss_instance(), $_SESSION['username']);
    output_result2($resp, array('user' => rtrim($_SESSION['username'], '/')));
} else {
    exit_on(401);
}

?>