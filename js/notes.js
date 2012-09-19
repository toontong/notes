String.prototype.format = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,function(m,i,o,n){
        return args[i];
    });
};

var USER  = "";

var NOTES_BUCKET = "notes_bucket";
var NOTES_FOLDER_PREFIX = USER + "notes_folder/";
var NOTES_TRASH_PREFIX = USER + "notes_trash/";
var NOTES_HISTORY_PREFIX = USER + "notes_history/";
var NOTES_LIST_TEMPLATE = '<div class="note_list" id="{0}" objkey="{1}" history="{2}" onclick="onclick_get_object(\'{0}\',\'{1}\')"><h2>{3}</h2><p><strong>{4}</strong> &nbsp;&nbsp;{5} </p></div>';
var DisplayView = {reading:0x1, editing:0x2, creating:0x3, saving:0x4, 
                   trashing:0x10, normal:0x20};
var MULTI_USER = null;

function on_http_status_not_200(response){
    if (response.status == 401){
        console.log(response);
        MULTI_USER = response.multi_user;
        return DISPLAY.display_login_dialog();
    }else if(response.status == 403){
        console.log(response);
        MULTI_USER = response.multi_user;
        if(!MULTI_USER)showinfo("oss_login_info", "access_key不正确");
        return DISPLAY.display_login_dialog();
    }
    console.error(response.status);
    console.error(response.body);
}

function AliyunOSS(){
    function Default_Resp_Handler(callback)
    {   
        this.handler = function(resp){
            try{
                 var response = JSON.parse(resp);
            } catch(e){
                return console.log(resp);
            }
            if (parseInt(response.status / 100) != 2){
                return on_http_status_not_200(response);
            }
            if (typeof callback != "undefined")
                callback(response);
            else
                console.log('default_resp_handler', response);
        };
    }

    this.create_bucket = function (bucket, acl, callback){
        var url = "actions/create_bucket.php";
        if (typeof(acl) == "undefined"){
            acl = "private";
        }
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":bucket, "acl":acl}, handler.handler, 'html');
    };
    this.get_bucket = function(prefix, marker, callback){
        var url = 'actions/get_bucket.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "prefix":prefix,"marker":marker}, handler.handler , 'html');
    };

    this.get_object = function(object_key, callback){
        var url = 'actions/get_object.php';
        $.post(url , {"bucket":NOTES_BUCKET, "object":object_key}, callback, 'html');
    };

    this.copy_put_object = function (object_key, title, disposition, content, history, callback){
        var url = 'actions/copy_put_object.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "object":object_key,
                      "title":title, "disposition":disposition,
                      "history":history, "content":content}, handler.handler, 'html');
    };

    this.put_object = function(object_key, title, disposition, content, callback){
        var url = 'actions/put_object.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "object":object_key,
                      "title":title, "disposition":disposition,
                      "content":content}, handler.handler, 'html');
    };

    this.get_object_meta = function (object_key, callback){
        var url = 'actions/head_object.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "object":object_key}, handler.handler , 'html');
    };
    
    this.delete_objects = function(object_key, history, callback){
        var url = 'actions/delete_objects.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "object":object_key, "history":history}, handler.handler, 'html');
    };

    this.move_object = function(src_obj, dest_obj, callback){
        var url = 'actions/move_object.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "object":src_obj,
                      "to_bucket":NOTES_BUCKET,"to_object":dest_obj}, handler.handler, 'html');
    };

    this.get_service = function (init_callback){
        var url = 'actions/get_service.php';
        $.post(url , {} , init_callback, 'html');
    };
}

var OSS = new AliyunOSS();

function Display(behavior){
    var DIALOG_LOGIN = null;
    this.behavior = behavior;

    this.display_title = function(title){
        $("#input_title").hide();
        $("#display_title").show();
        $("#display_title").empty();
        $("#display_title").append(title);
    };
    this.display_iframe =function(contents){
        editor.setHide();
        var body = $("#iframe").contents().find("body");
        body.show();
        body.empty();
        body.append(contents);
    };

    this.display_owner = function(owner){
        $("#owner").html(owner);
        $("#owner").show();
        $("#bt_logout").show();
        $("#bt_login").hide();
        $("#bt_new_note").show();
        this.display_iframe("Loading");
        this.display_title("Loading");
    };
    this.display_create_note = function(){
        this.behavior.display_vew = DisplayView.creating;
        editor.setShow();
        editor.setContent("");
        console.log('new notes');
        $("#display_title").hide();
        $("#bt_edit_note").hide();
        $("#bt_history").hide();
        $("#bt_save_note").show();
        $("#input_title").show();
        $("#input_title").val("");
        $("#iframe").contents().find("body").hide();
    };
    this.display_history = function(divid){
        $("#bt_history").show();
        var div = $('#' + divid);  
        var history = div.attr("history").split(";");
        $("#history_list").empty();
        var tmpl = '<li><a href="#" onclick="get_history(\'{0}\',\'{1}\')">{2}</a></li>';
        $("#history_list").append(tmpl.format(divid, div.attr("objkey"), "最新版"));
        for(var i in history.reverse()){
            if (history[i]){
                var d = new Date(parseFloat(history[i]) * 1000);
                var date = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
                date += " " + d.getHours()+":" + d.getMinutes();
                var key = NOTES_HISTORY_PREFIX + history[i];
                $("#history_list").append(tmpl.format(divid, key, date));
            }
        }
        $("#history_list").append('<li class="divider"></li><li><a href="#">取  消</a></li>');
    };
    this.display_save_note = function(title){
        BEHAVIOR.display_vew = DisplayView.saving;
        $("#bt_save_note").hide();
        $("#bt_delete_note").hide();
        DISPLAY.display_title(title);
        DISPLAY.display_iframe("<strong>Saving note....</strong>");
    };
    this.display_edit_note = function(divid){
        this.behavior.display_vew = DisplayView.editing;
        var div = $('#' + divid);
        $("#input_title").val(div.find('h2').html());
        $("#bt_edit_note").hide();
        $("#bt_history").hide();
        $("#bt_save_note").show();
        $("#input_title").show();
        $("#display_title").hide();
        editor.setShow();
        var body = $("#iframe").contents().find("body");
        editor.setContent(body.html());
        body.empty();
        body.hide();
    };
    this.display_login_dialog = function (){
        if(MULTI_USER)
            $('#login_modal').modal('show');
        else
            $('#oss_login_modal').modal('show');
    };
    this.close_login_dialog = function(){
        if(MULTI_USER)$('#login_modal').modal('hide');
        else $('#oss_login_modal').modal('hide');
    };
    this.display_login = function(owner){};
    this.display_logout = function(){
        this.behavior.selected_note_divid = null;
        this.behavior.current_folder = DisplayView.normal;
        $("#owner").html("Logouting");
        
        this.display_iframe("Unlogin");
        this.display_title("Unlogin");
        $("#all_notes_list").empty();
        $("#bt_login").show();
        $("#bt_logout").hide();
        $("#bt_new_note").hide();
        $("#bt_edit_note").hide();
        $("#bt_history").hide();
        $("#bt_delete_note").hide();
        console.log("Unlogin");
        this.display_login_dialog();
    };
    this.display_no_selected = function(){
        this.behavior.selected_note_divid = null;
        this.display_iframe("");
        this.display_title("");
        $("#bt_edit_note").hide();
        $("#bt_history").hide();
        $("#bt_delete_note").hide();
        $("#bt_save_note").hide();
    };
    this.display_normal = function(){
        this.behavior.current_folder = DisplayView.normal;
        this.behavior.pages_normal.current = 0;
        this.display_no_selected();
        $("#bt_new_note").show();
        $(".folder").removeClass().addClass("folder");
        $("#folder_all_notes").addClass("folder this");
    };
    this.display_trash = function(){
        this.behavior.current_folder = DisplayView.trashing;
        this.behavior.pages_trash.current = 0;
        this.display_no_selected();
        $("#bt_new_note").hide();
        $(".folder").removeClass().addClass("folder");
        $("#folder_trash").addClass("folder this");
    };
    this.display_read_note = function(divid){
        this.behavior.display_vew = DisplayView.reading;
        var div = $('#' + divid);
        this.display_title(div.find('h2').html());
        this.display_iframe("<strong>Loading Note Data.</strong>");
        
        if(this.behavior.current_folder == DisplayView.trashing){
            $("#bt_edit_note").hide();
        } else {
            $("#bt_edit_note").show();
        }
        
        $(".note_list").removeClass().addClass("note_list");
        div.addClass("note_list this");
    };
    this.display_note = function(resp){
        $("#bt_save_note").hide();
        $("#bt_delete_note").show();
        if(this.behavior.current_folder == DisplayView.normal)
            $("#bt_edit_note").show();
        switch(this.behavior.display_vew){
        case DisplayView.creating:
            $("#bt_edit_note").show();
            break;
        case DisplayView.editing:
            editor.setContent(resp);
            $("#bt_save_note").show();
            break;
        case DisplayView.reading:
        default:
            this.display_iframe(resp);
        }
    };
};

function Pages(){
    this.current = 0;
    this.pages = {0:""};
    this.append_next = function(marker){
        for (var i = 1; i ; i++) {
            if(!this.pages.hasOwnProperty(i)){
                this.pages[i] = marker;
                break;
            }
        };
    }
}

function Behavior(){
    this.selected_note_divid = null;
    this.display_vew = null;
    this.current_folder = null;
    this.pages_normal = new Pages();
    this.pages_trash = new Pages();
    this.append_next = function(marker){
        if(typeof marker === "undefined"){
            return;
        }
        if(marker.indexOf(NOTES_FOLDER_PREFIX) == 0){
            this.pages_normal.append_next(marker);
        } else if(marker.indexOf(NOTES_TRASH_PREFIX) == 0){
            this.pages_trash.append_next(marker);
        } else{
            console.log("append_next", marker);
        }
    }
    this.get_page = function(){
        return  this.current_folder == DisplayView.normal ? this.pages_normal : this.pages_trash
    }
}

var BEHAVIOR = new Behavior();
var DISPLAY = new Display(BEHAVIOR);

function page_jump(index){
    var pages = BEHAVIOR.get_page();
    var prefix = BEHAVIOR.current_folder == DisplayView.normal ? NOTES_FOLDER_PREFIX : NOTES_TRASH_PREFIX;
    var curr = pages.current;
    nextmarker = pages.pages[curr + index];
    if(nextmarker == undefined){
        return false;
    }
    OSS.get_bucket(prefix, nextmarker, init_notes_folder);
    pages.current += index;
    return true;
}

function next_page(){
    if(!page_jump(1))
        showinfo("tooltip", "已是最后一页");
}
function pre_page(){
    if(!page_jump(-1))
        showinfo("tooltip", "已是第一页");
}

function onclick_login(){
    DISPLAY.display_login_dialog();
}
    
function hash(psw){
    // 加长password为了不容易反查原密码
    return hex_md5(psw.toLocaleUpperCase() + '^o^2TooNTonG');
}

function register(){
    var username = $("#create_username").val();
    var password = $("#create_password").val();
    var psw_again = $("#create_psw_again").val();
    if(!username)
        return showinfo("reg_info", '用户名不能为空');
    if(username.indexOf("/") != -1)
        return showinfo("reg_info", '用户名不能有非法字符');
    if(!password)
        return showinfo("reg_info", '密码不能为空');
    if(password.length < 6)
        return showinfo("reg_info", '安全起见，密码不能少于6位');
    if(password != psw_again)
        return showinfo("reg_info", '两次密码输入不相等.');

    console.log("to register new user", username, password);

    var url = "actions/register.php";
    $.post(url, {username:username, password_hash:hash(password)}, function(resp){
        try{

            var res = JSON.parse(resp);
            if (res.status == 200){
                global_init(username);
                OSS.get_bucket(NOTES_FOLDER_PREFIX, "", init_notes_folder);
                DISPLAY.close_login_dialog();
            } else if (res.status == 404){
                showinfo("reg_info", "用户已存在，请使用密码登录");
                $("#login_username").val(username);
                $("#login_password").focus();
                $("#create_password").val("");
                $("#create_psw_again").val("");
            }else
                console.log(res);
        }catch(e){
            console.error(e);
            console.log(resp);
            return on_http_status_not_200(resp);
        }
    }, "html");
    showinfo("reg_info", "正在注册...");
}

function showinfo(id, msg){
    var info = $("#" + id);
    info.html('<a class="close" data-dismiss="alert">×</a>' + msg);
    info.show();
    setTimeout(function(){info.hide()}, 2000);
}

function forget_password(){
    showinfo("login_info", "正在推出..")
}

function login(is_show){
    if(!MULTI_USER)
        return access_key_login();
    var url = 'actions/login.php';
    BEHAVIOR.selected_note_divid = null;
    var username = $("#login_username").val();
    var password = $("#login_password").val();

    $.post(url , {username:username,
                  password_hash:hash(password)}, function(response)
    {
        try{
            var res = JSON.parse(response);
        }catch(e){
            console.error(e);
            console.log(response);
            if(is_show)
                showinfo("login_info", "登录异常 ");
            return on_http_status_not_200(response);
        }
        if(res.status == 200){
            global_init(res.user);
            init_notes_folder(res);
            $("#login_password").val("");
            DISPLAY.close_login_dialog();
        } else if (res.status == 404 || res.status == 405){
            if(is_show)
                showinfo("login_info", "用户名或密码不正确!");
            $("#login_password").select();
            $("#login_password").focus();
            console.log("login ret", res);
        } else {
            if(is_show)
                showinfo("login_info", "登录失败 " + res.status);
            return on_http_status_not_200(res);
        }
    }, "html");
    if(is_show)
        showinfo("login_info", "正在登录...");
}

function global_init(username){
    USER = username;
    DISPLAY.display_owner(USER);
    NOTES_FOLDER_PREFIX = USER + "/notes_folder/";
    NOTES_TRASH_PREFIX = USER + "/notes_trash/";
    NOTES_HISTORY_PREFIX = USER + "/notes_history/";
}

function access_key_login(){
    var url = 'actions/login.php';

    BEHAVIOR.selected_note_divid = null;

    $.post(url , {access_key:$("#access_key").val(),
                  access_id:$("#access_id").val(),
                  host:$("#oss_host").val(), } , function(response)
    {
        try{
            var res = JSON.parse(response);
        }catch(e){
            console.log(response);
            return on_http_status_not_200(response);
        }
        if(res.status == 200)
            DISPLAY.close_login_dialog();
        init_service(response);
    }, "html");
}

function logout(){
    var url = 'actions/logout.php';
    $.post(url , {access_key:$("#access_key").val(),
                  access_id:$("#access_id").val(),
                  host:$("#host").val()}, function(response){
        console.log(response);
        $("#owner").html("Unlogin");
    }, "html");

    DISPLAY.display_logout();
}

function get_history(divid, object_key){
    DISPLAY.display_read_note(divid);
    OSS.get_object(object_key, function(resp){
        DISPLAY.display_note(resp);
    });
    console.log('call get history object', object_key);
}

function onclick_get_object(divid, object_key){
    // TODO: 如果 div的class已经是"note_list this" 则直接返回
    if (BEHAVIOR.selected_note_divid == divid)
        return;
    BEHAVIOR.selected_note_divid = divid;

    DISPLAY.display_read_note(divid);
    DISPLAY.display_history(divid);
    OSS.get_object(object_key, function(resp){
        DISPLAY.display_note(resp);
    });
    console.log('call get object', object_key);
}

function new_note(){
    BEHAVIOR.selected_note_divid = null;
    DISPLAY.display_create_note();
}

function delete_note(){
    if (BEHAVIOR.selected_note_divid == null)
        return;
    var div = $('#' + BEHAVIOR.selected_note_divid);
    var object_key = div.attr("objkey");
    if (typeof object_key === "undefined"){
        console.log('undefined note', BEHAVIOR.selected_note_divid);
        return;
    }

    function click_next_note(){
        var next = div.next();
        div.remove();
        if (next.attr("id") === undefined){
            try{
                next = $("#all_notes_list").children()[0];
                if (next.id != null)
                    next.onclick();
                else 
                    return new_note();
            }catch (e){return new_note();}
        }
        onclick_get_object(next.attr("id"), next.attr("objkey"));
    }

    DISPLAY.display_iframe("正在删除... ");
    if (0 == object_key.indexOf(NOTES_FOLDER_PREFIX)){
        // 先放到回收站
        var dest_obj = NOTES_TRASH_PREFIX + object_key.substr(NOTES_FOLDER_PREFIX.length)
        console.log("src", object_key, "dest", dest_obj);
        OSS.move_object(object_key, dest_obj, click_next_note);
    } else if(0 == object_key.indexOf(NOTES_TRASH_PREFIX)){
        // 已在回收站中，直接删除，包括历史版本
        OSS.delete_objects(object_key, div.attr("history"), click_next_note);
    }   
}

function edit_note(){
    if (BEHAVIOR.selected_note_divid == null)
        return;
    DISPLAY.display_edit_note(BEHAVIOR.selected_note_divid);
}

function save_note(){
    console.log('save notes');
    var title = $("#input_title").val();
    var txt = editor.getContentTxt().substr(0, 128);
    var content = editor.getContent();
    if (title.length < 1){
        title = "Untitled";
    }
    if(txt.length < 1 || content.length < 1){
        alert("空内容");
        return;
    }

    var now = new Date();
    var object_key = "";
    var history = "";
    var selected_divid = BEHAVIOR.selected_note_divid;

    if(selected_divid == null){
        object_key = NOTES_FOLDER_PREFIX + now.getTime();
        console.log("creating a new note", object_key);
    } else {
        var div = $('#' + selected_divid);
        object_key = div.attr("objkey");
        history = div.attr("history");
        if (typeof object_key === "undefined") {
            console.log('undefined note', selected_divid, div);
            return;
        }
        console.log("changing a old note", object_key);
    }

    function after_save(res){
        DISPLAY.display_note(content);
        var lastmodified = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();

        if (selected_divid == null){
            // 新建保存
            selected_divid = BEHAVIOR.selected_note_divid = Math.random().toString().substr(2);
            $("#all_notes_list").prepend(
                NOTES_LIST_TEMPLATE.format(BEHAVIOR.selected_note_divid, object_key, "",
                    title, lastmodified, txt));
            $(".note_list").removeClass().addClass("note_list");
            $("#" + selected_divid).addClass("note_list this");
        } else {
            var div = $('#' + selected_divid);
            div.empty();
            div.append("<h2>{0}</h2><p><strong>{1}</strong><span>&nbsp;&nbsp;{2}</span></p>".format(title, lastmodified, txt));
            div.attr("history", res.header["x-oss-meta-history"]);
        }
        if (selected_divid == BEHAVIOR.selected_note_divid)
            DISPLAY.display_history(selected_divid);
    }
    DISPLAY.display_save_note(title);

    if(BEHAVIOR.selected_note_divid == null){
        OSS.put_object(object_key, title, txt, content, after_save);
    } else{
        OSS.copy_put_object(object_key, title, txt, content, history,after_save);
    }
}

function get_trash(){
    if(BEHAVIOR.current_folder == DisplayView.trashing)
        return;
    DISPLAY.display_trash();
    OSS.get_bucket(NOTES_TRASH_PREFIX, "", init_notes_folder);
}

function get_notes(){
    if(BEHAVIOR.current_folder == DisplayView.normal)
        return;
    DISPLAY.display_normal();
    OSS.get_bucket(NOTES_FOLDER_PREFIX, "", init_notes_folder);   
}

function init_notes_folder(resp){
    // common_prefix是带斜杠'/'结束的，为文件夹. type is Array;
    // var common_prefix = res.listbucketresult.commonprefixes;
    // contents是文件. type is Array
    $("#all_notes_list").empty();

    var res = xmlToJson.parser(resp.body);
    console.log(res);

    var contents = res.listbucketresult.contents;
    BEHAVIOR.append_next(res.listbucketresult.nextmarker);
    if (typeof contents === "undefined"){
        if(BEHAVIOR.current_folder == DisplayView.normal){
            DISPLAY.display_iframe('<h3>Did not have any notes.</h3>');
            DISPLAY.display_title('<a href="#" onclick="new_note()">Click here  to create note</a>');
        }
        return;
    }

    function add_object_to_view(obj)
    {
        if(obj.key.substr(-1) != "/")
        {
            OSS.get_object_meta(obj.key, function(res)
            {
                var header = res.header;
                var history = "";
                if (typeof header["x-oss-meta-history"] !== "undefined" ){
                    history = header["x-oss-meta-history"];
                }
                $("#all_notes_list").append(
                    NOTES_LIST_TEMPLATE.format(Math.random().toString().substr(2), obj.key, history,
                                               header["x-oss-meta-title"], 
                                               obj.lastmodified.substr(0, 10),
                                               header["x-oss-meta-disposition"])
                );
            });
        }
    }
    if (contents.constructor === Array){
        for(var key in contents.reverse()){
            add_object_to_view(contents[key]);
        }
    }else{
        add_object_to_view(contents);
    }
    DISPLAY.display_no_selected();
}

/* 初始化过程
* 1)新建设一个bucket为: NOTES_BUCKET
*/
function init_service(response)
{
    try{
        response = JSON.parse(response);
    }catch(e){
        console.log(response);
        return DISPLAY.display_login_dialog();
    }

    if (parseInt(response.status / 100) != 2){
        return on_http_status_not_200(response);
    }

    var res = xmlToJson.parser(response.body);
    var buckets = res.listallmybucketsresult.buckets.bucket;
    var owner = res.listallmybucketsresult.owner;

    DISPLAY.display_owner(owner.displayname);
    console.log(owner.id, owner.displayname);

    var has_notes_bucket = false;
    for(var key in buckets){
        console.log(buckets[key].name, buckets[key].creationdate);
        if(buckets[key].name == NOTES_BUCKET){
            has_notes_bucket = true;
            break;
        }
    }

    if (!has_notes_bucket){
        OSS.create_bucket(NOTES_BUCKET, "private", function(response){
            OSS.get_bucket(NOTES_FOLDER_PREFIX, "", init_notes_folder);
        });
    } else {
        OSS.get_bucket(NOTES_FOLDER_PREFIX, "", init_notes_folder);
    }
}

function init_notes(){
    // 多用户时：
    login(false);
    // 单用户时使用：
    //OSS.get_service(init_service);
}

