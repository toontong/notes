<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>OSS云笔记</title>
  <link rel="shortcut icon" href="images/favicon.ico"/>
  <link rel="stylesheet" href="bootstrap/css/bootstrap.min.css" />
  <link rel="stylesheet" href="css/note.css"/>
  <link rel="stylesheet" href="css/dialog.css" />
  <link rel="stylesheet" href="ueditor/themes/default/ueditor.css" />
</head>

<body>
  <div>
    <div id="modal_about" class="modal hide fade" >
      <div class="modal-header">
        <a class="close" data-dismiss="modal">×</a>
        <h4>关于OSS云笔记</h4>
      </div>
      <div class="modal-body">
        <p>本项目演示地址<a href="http://yunnote.co.cc" target="_blank">http://yunnote.co.cc</a></p>
        <p>本项目由<a href="http://www.aliyun.com" target="_blank">aliyun.com</a>OSS作存储驱动</p>
        <p>本项目源代码托管在<a href="https://github.com/toontong/notes" target="_blank">github.com</a></p>
        <p>本项目运行在<a href="http://sae.sina.com.cn" target="_blank">Aliyun.com</a>云服务器</p>
        <p>本项目在线编辑器由<a href="http://ueditor.baidu.com" target="_blank">baidu.com</a>提供</p>
        <hr>
        <h5>本项目已实现功能包括：</h5>
        <p>1).单用户、多用户云笔记支持</p>
        <p>2).回收站</p>
        <p>2).历史版本</p>
        <hr>
        <h5>TODO</h5>
        <p>分享功能。包括weibo，Email，web 共享</p>
        <p>把notes转为定时邮件功能</p>
        <p>标签功能、统计功能</p>
        <hr>
        <p>推荐使用Chrome，猎豹，firefox浏览器使用本产品</p>
      </div>
      <div class="modal-footer">
        <a href="#" class="btn btn-primary" onclick="$('#modal_about').modal('hide')">关闭</a>
      </div>
    </div>
    <!-- 头部start -->
    <div class="top">
      <div class="float_left"><a href="#" onclick="$('#modal_about').modal({backdrop:false})">About OSS云笔记</a></div>
      <!-- Baidu Button BEGIN -->      
      <div id="bdshare" class=" bdshare_t bds_tools get-codes-bdshare">
        <span class="bds_more">分享到：</span>
        <a class="bds_tsina"></a>
        <a class="bds_tqq"></a>
        <a class="bds_qzone"></a>
        <a class="bds_renren"></a>
        <a class="shareCount"></a>
      </div>
      <script type="text/javascript" id="bdshare_js" data="type=tools" ></script>
      <script type="text/javascript" id="bdshell_js"></script>
      <script type="text/javascript">
        document.getElementById("bdshell_js").src = "http://bdimg.share.baidu.com/static/js/shell_v2.js?cdnversion=" + new Date().getHours();
      </script>
      <!-- Baidu Button END -->      
      <div class="exit"> 
        <i class="icon-user icon-white"></i>
        <a href="#" id="owner">Unlogin</a>
        |
        <a href="#" id="bt_logout" onclick="logout()">退出</a>
        <a href="#" id="bt_login" onclick="onclick_login()">登录</a>
      </div>
    </div>
    <!-- 头部end -->
    <div class="content">
      <!--左侧-->
      <div class="left_folder">
        <div id="folder_all_notes" class="folder" onclick="get_notes()"> <i class="icon-home "></i> <strong>All Notes</strong>
        </div>
        <div id="folder_trash" class="folder" onclick="get_trash()">
          <i class="icon-trash"></i> <strong>Trash</strong>
        </div>
      </div>
      <!-- 中间start -->
      <div class="middle">
        <h3>
          笔记列表
          <a href="#" id="bt_new_note" onclick="new_note()" class="btn btn-mini btn-info float_right">
            <i class="icon-plus icon-white"></i>
            新建笔记
          </a>
        </h3>
        <div id="all_notes_list" class="note_list_all">
          <div class="note_list this">
            <h2>未登录</h2>
          </div>
        </div>
      </div>
      <div class="pagination pages_list">
        <ul id="page_list">
          <li>
            <a href="#" onclick="pre_page()">←</a>
          </li>
          <li>
            <a href="#" onclick="next_page()">→</a>
          </li>
        </ul>
      </div>
      <div id="tooltip" class="pages_list alert alert-info hide" style="left:200px;">
      </div>
      <!-- 中间end -->
      <!-- 右边start -->
      <div class="right">
        <div id="button_bar" class="button_bar">
          <a href="#" id="bt_edit_note" class="btn btn-mini btn-info float_left" onclick="edit_note()">
            <i class="icon-edit icon-white"></i>
            编辑笔记
          </a>
          <a href="#" id="bt_save_note" class="btn btn-mini btn-info float_left" onclick="save_note()">
            <i class="icon-book icon-white"></i>
            保存笔记
          </a>
          <a href="#" id="bt_delete_note" class="btn btn-mini btn-info float_right"  onclick="delete_note()">
            <i class="icon-remove icon-white"></i>
            删除笔记
          </a>
        </div>
        <div class="note_title">
          <span id="display_title"></span>
          <input id="input_title" placeholder="Untitled" value="" type="text" name="input_title" style="width:90%"/>
          <div id="bt_history" class="btn-group" style="float:right;">
            <button class="btn btn-mini btn-info">
              <i class="icon-retweet icon-white"></i>
              历史版本
            </button>
            <button class="btn btn-mini btn-info dropdown-toggle" data-toggle="dropdown">
              <span class="caret"></span>
            </button>
            <ul id="history_list" class="dropdown-menu pull-right">
              <li>
                <a href="#">还没有编辑</a>
              </li>
              <li class="divider"></li>
              <li>
                <a href="#">取  消</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="edit">
          <script type="text/plain" id="editor" name="editor"></script>
          <iframe width="100%" height="100%" frameborder=0 scrolling=auto src="bank.html" id="iframe"></iframe>
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
  <div id="login_modal" class="modal hide fade" style="display:none; width:720px;">
    <div class="modal-header">
      <a class="close" data-dismiss="modal" id="">×</a>
      <h3>登录/注册新用户</h3>
    </div>
    <div class="modal-body">
      <div class="container" style=" width:700px;">
        <div class="row">
          <div class="span4">
            <form class="form-vertical">
              <fieldset>
                <legend >旧用户</legend>
                <div class="control-group">
                  <label class="control-label" for="login_username">Username</label>
                  <div class="controls">
                    <input type="text" class="input-big" id="login_username"></div>
                </div>
                <div class="control-group">
                  <label class="control-label" for="login_password">Password</label>
                  <div class="controls">
                    <input type="password" class="input-big" id="login_password"></div>
                </div>
                <div class="control-group">
                  <a href="#" onclick="forget_password()">忘记密码</a>
                </div>
                <div class="control-group">
                  <button class="btn btn-info" onclick="login(true)">登录</button>
                </div>
                <fieldset>
                <div id="login_info" class="alert alert-info hide">
                </div>
            </form>
          </div>
          <div class="span4">
            <form class="form-vertical">
              <fieldset>
                <legend >新用户注册</legend>
                <div class="control-group">
                  <label class="control-label" for="create_username">Username</label>
                  <div class="controls"><input type="text" class="input-big" id="create_username" placeholder="可以是Email"></div>
                </div>
                <div class="control-group">
                  <label class="control-label" for="create_password">Password</label>
                  <div class="controls"><input type="password" class="input-big" id="create_password" placeholder="不少于6个字符"></div>
                </div>
                <div class="control-group">
                  <label class="control-label" for="create_psw_again">Password Again</label>
                  <div class="controls"><input type="password" class="input-big" id="create_psw_again"></div>
                </div>
                <div class="control-group">
                  <button class="btn btn-info" onclick="register()">注册</button>
                </div>
              <fieldset>
              <div id="reg_info" class="alert alert-info hide"></div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <a href="#" class="btn btn-primary" data-dismiss="modal" id="">关闭</a>
    </div>
  </div>
    <div id="oss_login_modal" class="modal hide fade" style="display:none; width:400px;">
    <div class="modal-header">
      <a class="close" data-dismiss="modal" id="">×</a>
      <h3>OSS ACCESS_KEY登录 - 单用户模式</h3>
    </div>
    <div class="modal-body">
      <div class="container" style=" width:360px;">
        <div class="row">
          <div class="span4">
            <form class="form-vertical">
              <fieldset>
                <legend >OSS ACCESS_KEY 登录</legend>
                <div class="control-group">
                  <label class="control-label" for="access_id">ACCESS_ID</label>
                  <div class="controls">
                    <input type="text" class="input-big" id="access_id"></div>
                </div>
                <div class="control-group">
                  <label class="control-label" for="access_key">ACCESS_KEY</label>
                  <div class="controls">
                    <input type="text" class="input-big" id="access_key"></div>
                </div>
                <div class="control-group">
                  <label class="control-label" for="oss_host">HOST</label>
                  <div class="controls">
                    <input type="text" value="storage.aliyun.com" class="input-big" id="oss_host"></div>
                </div>
                <div class="control-group">
                  <button class="btn btn-info" onclick="login(true)">登录</button>
                </div>
                <fieldset>
                <div id="oss_login_info" class="alert alert-info hide">
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <a href="#" class="btn btn-primary" data-dismiss="modal" id="">关闭</a>
    </div>
</body>
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript">
  $("#dialog_login").hide();
  $("#bt_edit_note").hide();
  $("#bt_save_note").hide();
  $("#bt_delete_note").hide();
  $("#input_title").hide();
  $("#bt_logout").hide();
  $("#bt_new_note").hide();
  $("#bt_history").hide();
</script>
<script type="text/javascript" src="js/xml2json.js" ></script>
<script type="text/javascript" src="js/md5.js"></script>
<script type="text/javascript" src="bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="ueditor/editor_config.js"></script>
<script type="text/javascript" src="ueditor/editor.min.js"></script>
<script type="text/javascript" src="js/notes.js?<?php echo time()?>"></script>
<script type="text/javascript">

var editor = new UE.ui.Editor({UEDITOR_HOME_URL:"ueditor/", isShow:false});

editor.render('editor');

init_notes();

</script>

</html>
