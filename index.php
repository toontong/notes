<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Aliyun Notes on Web</title>
        <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css" /> <!-- -->
        <link rel="stylesheet" href="css/note.css"/>
        <link rel="stylesheet" href="css/dialog.css" />
        <link rel="shortcut icon" href="images/favicon.ico"/>
        <script type="text/javascript" src="js/jquery.js"> </script>
        <script type="text/javascript" src="js/xml2json.js" ></script>
        <script type="text/javascript" src="js/dialog.js"></script>
        <script type="text/javascript" src="bootstrap/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="js/notes.js?<?php echo time()?>"></script>
        <script type="text/javascript" src="ueditor/editor_config.js"></script>
        <script type="text/javascript" src="ueditor/editor.min.js"></script>
        <link rel="stylesheet" href="ueditor/themes/default/ueditor.css" />
    </head>

    <body>
        <div>
            <!-- 头部start -->
            <div class="top">
                <div class="exit">
                    <a href="#" id="owner">Unlogin</a> | 
                    <a href="#" id="bt_logout" onclick="logout()">退出</a>
                    <a href="#" id="bt_login" onclick="show_login_dialog()">登录</a>
                </div>
            </div>
            <!-- 头部end -->
            <div class="content">
                <!--左侧-->
                <div class="left_folder">
                    <div id="folder_all_notes" class="folder" onclick="get_notes()"><strong>All Notes</strong></div>
                    <div id="folder_trash" class="folder" onclick="get_trash()"><strong>Trash</strong></div>
                </div>
                <!-- 中间start -->
                <div class="middle">
                    <h3>笔记列表<a href="#" id="bt_new_note" onclick="new_note()" class="new_note">新建笔记</a></h3>
                    <div id="all_notes_list" class="note_list_all">
                        <div class="note_list this">
                            <h2>正在加载</h2>
                            <p>
                                <strong><?php echo date(DATE_RFC822)?></strong>
                                <span>Loading</span>
                            </p>
                        </div>
                    </div>
                </div>
                <!-- 中间end -->
                <!-- 右边start -->
                <div class="right">
                    <div id="button_bar" class="button_bar">
                        <a href="#" id="bt_edit_note" class="new_note" style="float:left" onclick="edit_note()">编辑笔记</a>
                        <a href="#" id="bt_save_note" class="new_note" style="float:left" onclick="save_note()">保存笔记</a>
                        <a href="#" id="bt_delete_note" class="new_note"  onclick="delete_note()">删除笔记</a>
                    </div>
                    <div class="note_title">
                    	<span id="display_title"> </span>
                    	<input id="input_title" placeholder="Untitled" value="" type="text" name="input_title" style="width:90%"/>
                        <div id="bt_history" class="btn-group" style="float:right;">
                            <button class="btn btn-mini btn-info">历史版本</button>
                            <button class="btn btn-mini btn-info dropdown-toggle" data-toggle="dropdown">
                                <span class="caret"></span>
                            </button>
                            <ul id="history_list" class="dropdown-menu pull-right">
                                <li><a href="#">还没有编辑</a></li>
                                <li class="divider"></li>
                                <li><a href="#">取  消</a></li>
                            </ul> 
                        </div>
                    </div>
                    <div class="edit">
                        <script type="text/plain" id="editor" name="editor"></script>
                        <iframe width="100%" height="100%"  frameborder=0 scrolling=auto src="bank.html" id="iframe"></iframe>
                    </div>
                </div>
                <!-- 右边end -->
                <div class="cb"></div>
            </div>
        </div>
        <script id ="dialog_login" type="text/plain">
        	<div id ="dialog_login_div" class="note_list">
                <div>Access_id:<input type="text" id="access_id" value=""/></div>
                <div>Access_Key:<input type="text" id="access_key" value="="/></div>
                <div>Host :<input type="text" id="host" value="storage.aliyun.com"/></div>
                <a href="#" id="bt_login" class="new_note" onclick="login()">提交</a>
			</div>
        </script>
    </body>
<script type="text/javascript">

$("#dialog_login").hide();
$("#bt_edit_note").hide();
$("#bt_save_note").hide();
$("#bt_delete_note").hide();
$("#input_title").hide();
$("#bt_logout").hide();
$("#bt_new_note").hide();
$("#bt_history").hide();

var editor = new UE.ui.Editor({UEDITOR_HOME_URL:"ueditor/", isShow:false});

editor.render('editor');

init_notes();

</script>
</html>

