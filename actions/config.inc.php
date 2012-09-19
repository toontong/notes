<?php
// 设置为true，支持用户注册，用户使用密码登录，所有用户文件保存在同一个NOTES_BUCKET中，各用户笔记使用prefix区分
// 设置为false，只支持单用户，用户使用oss的ACCESS_ID与ACCESS_KEY登录
define('MULTI_USER_SUPPORT', TRUE);

// 如果 MULTI_USER_SUPPORT 设置为false，不必设置以下三个值。
define('ACCESS_ID', "");
define('ACCESS_KEY', "=");
define('HOST_OSS', 'storage.aliyun.com');

// 每个笔记的历史版本最大个数
define("MAX_HISTORY_COPY", 5);

// 非必要，请不要修改以下值
define('NOTES_BUCKET', "notes_bucket");
define("NOTES_FOLDER_PREFIX", "notes_folder/");
define("NOTES_TRASH_PREFIX", "notes_trash/");
define("NOTES_HISTORY_PREFIX", "notes_history/");