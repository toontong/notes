NOTES on web support by Aliyun.com
==============

* 推荐使用Chrome，firefox，猎豹 浏览器使用本产品
* 本项目简易域名为 http://yunnote.co.cc
* 本项目使用 http://www.aliyun.com的OSS作为存储驱动
* 本项目源代码托管在 https://www.github.com/toontong/notes
* 本项目运行在SAE所提供服务器 http://sae.sina.com.cn/
* 本项目在线编辑器由http://ueditor.baidu.com提供


* 本项目已实现功能包括：
-------
    1).单用户、多用户云笔记支持
    2).回收站
    2).历史版本


TODO
-------
    分享功能。包括weibo，Email，web 共享
    把notes转为定时邮件功能
    标签功能、统计功能


安装本代码，请修改actions/config.inc.php 文件
-------
    // 设置为true，支持用户注册，用户使用密码登录，所有用户文件保存在同一个NOTES_BUCKET中，各用户笔记使用prefix区分
    // 设置为false，只支持单用户，用户使用oss的ACCESS_ID与ACCESS_KEY登录
    define('MULTI_USER_SUPPORT', TRUE);

    // 如果 MULTI_USER_SUPPORT 设置为false，不必设置以下三个值。
    define('ACCESS_ID', "请输入自己的ACCESS_ID");
    define('ACCESS_KEY', "请输入自己的ACCESS_KEY");
    define('HOST_OSS', 'storage.aliyun.com');

    // 每个笔记的历史版本最大个数
    define("MAX_HISTORY_COPY", 5);
    