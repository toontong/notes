<?php
session_start();

$access_key = isset($_POST['access_key']) ? $_POST['access_key'] : $_GET['access_key'];
$access_id = isset($_POST['access_id']) ? $_POST['access_id'] : $_GET['access_id'];
$host = isset($_POST['host']) ? $_POST['host'] : $_GET['host'];

$res = array();
$res['status'] = 200;

if (!$access_key || !$access_id)
{
    header("HTTP/1.1 400 Bad Request");
    $res['access_key'] = $access_key;
    $res['access_id'] = $access_id;
    $res['host'] = $host;
    //var_dump($res);
    echo json_encode($res);
    exit();
}
if(!$host)
    $host = 'storage.aliyun.com';

$_SESSION['host'] = $host;
$_SESSION['access_id']   = $access_id; 
$_SESSION['access_key']  = $access_key;

require_once 'get_service.php';

?>