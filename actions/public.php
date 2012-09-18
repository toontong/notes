<?php

require_once "config.inc.php";
require_once '../include/oss_sdk/sdk.class.php';
session_start();

function exit_on($code){
    $body = "unkown";
    switch ($code) {
        case 403:
            $body = "403 Forbidden";
            break;
        case 400:
            $body = "400 Bad Request";
            break;
        default:
            $body ="UNKOWN";
            break;
    }
    echo json_encode(array('status' => $code,'body'=> $body));
    exit();
}

function get_oss_instance(){
    if (isset($_SESSION['access_key']))
    {
        $oss_sdk_service = new ALIOSS($_SESSION['access_id'], $_SESSION['access_key'], $_SESSION['host']);
    } elseif(isset($_SESSION['username'])){
        $oss_sdk_service = new ALIOSS(ACCESS_ID, ACCESS_KEY, HOST_OSS);
    } else {
        return exit_on(403);
    }

    //设置是否打开curl调试模式
    $oss_sdk_service->set_debug_mode(FALSE);
    return  $oss_sdk_service;
}

function output_result($response){
    $res = array();
    $res['status'] = $response->status;
    $res['body'] = $response->body;
    unset($response->header['x-oss-requestheaders']);
    $res['header'] = $response->header;
    echo json_encode($res);
}
function output_result2($response, $arr){
    $res = array();
    $res['status'] = $response->status;
    $res['body'] = $response->body;
    unset($response->header['x-oss-requestheaders']);
    $res['header'] = $response->header;
    $res += $arr;
    echo json_encode($res);
}

?>