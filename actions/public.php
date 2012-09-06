<?php

function get_oss_instance(){
    session_start();
    if (!isset($_SESSION['access_key']))
    {
        echo json_encode(array('status' => 403 ));
        exit();
    }

    /**
     * 加载oss_sdk包以及错误代码包
     */
    require_once '../include/oss_sdk/sdk.class.php';

    $oss_sdk_service = new ALIOSS($_SESSION['access_id'], $_SESSION['access_key'], $_SESSION['host']);

    //设置是否打开curl调试模式
    $oss_sdk_service->set_debug_mode(FALSE);
    return  $oss_sdk_service;
}



function output_result($response){
    $res = array();
    $res['status'] = $response->status;
    $res['body'] = $response->body;
    $res['header'] = $response->header;

    echo json_encode($res);
}

?>