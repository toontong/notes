<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Aliyun Notes on Web</title>
        <link href="css/note.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript" src="js/jquery.js"> </script>
        <script type="text/javascript" src="js/xml2json.js" ></script>
        <script type="text/javascript" src="js/dialog.js"></script>
        <script type="text/javascript" src="js/notes.js?<?php echo time()?>"></script>
        <script type="text/javascript" src="ueditor/editor_config.js"></script>
        <script type="text/javascript" src="ueditor/editor.min.js"></script>
        <link rel="stylesheet" href="ueditor/themes/default/ueditor.css" />
        <link rel="stylesheet" href="css/dialog.css" />
        <link rel="shortcut icon" href="images/favicon.ico"/>
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
                <!-- 中间start -->
                <div class="left">
                    <h3>文件名<a href="#" id="bt_new_note" onclick="new_notes()" class="new_note">新建笔记</a></h3>
                    
                    <div id="all_notes_list" class="note_list_all">
                        
                        <div class="note_list this">
                            <h2>正在加载</h2>
                            <p>
                                <strong>2012-9-2</strong>
                                <span>loading....</span>
                            </p>
                        </div>
                    </div>
                </div>
                <!-- 中间end -->
                <!-- 右边start -->
                <div class="right">
                    <div class="button_bar">
                        <a href="#" id="bt_edit_note" class="new_note" style="float:left" onclick="edit_notes()">编辑笔记</a>
                        <a href="#" id="bt_save_note" class="new_note" style="float:left" onclick="save_notes()">保存笔记</a>
                    </div>
                    <div class="note_title">
                    	<span id="display_title"> </span>
                    	<input id="input_title" placeholder="Untitled" value="" type="text" name="input_title" style="width:90%"/>
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
                <div>Access_Key:<input type="text" id="access_key" value=""/></div>
                <div>Host :<input type="text" id="host" value="storage.aliyun.com"/></div>
                <a href="#" id="bt_login" class="new_note" onclick="login()">提交</a>
			</div>
        </script>
    </body>
<script type="text/javascript">

$("#dialog_login").hide();
$("#bt_edit_note").hide();
$("#bt_save_note").hide();
$("#input_title").hide();
$("#bt_logout").hide();
$("#bt_new_note").hide();

var editor = new UE.ui.Editor({UEDITOR_HOME_URL:"ueditor/", isShow:false});

editor.render('editor');

init_notes();

</script>
</html>

