String.prototype.format = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,function(m,i,o,n){
        return args[i];
    });
};

var NOTES_BUCKET = "notes_bucket";
var NOTES_FOLDER_PREFIX = "notes_folder/";
var NOTES_TRASH_PREFIX = "notes_trash/";
var NOTES_HISTORY_PREFIX = "notes_history/";
var NOTES_LIST_TEMPLATE = '<div class="note_list" id="{0}" objkey="{1}" history="{2}" onclick="onclick_get_object(\'{0}\',\'{1}\')"><h2>{3}</h2><p><strong>{4}</strong><span>&nbsp;&nbsp;{5}</span></p></div>';
var DisplayView = {reading:0x1, editing:0x2, creating:0x3, saving:0x4, 
                   trashing:0x10, normal:0x20};

function on_http_status_not_200(response){
    if (response.status == 403){
        console.log(response);
        return show_login_dialog();
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

    this.get_bucket = function(prefix, callback){
        var url = 'actions/get_bucket.php';
        var handler = new Default_Resp_Handler(callback);
        $.post(url , {"bucket":NOTES_BUCKET, "prefix":prefix}, handler.handler , 'html');
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
        return this.copy_put_object(object_key, title, disposition, content, '', callback)
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

    this.init = function (init_callback){
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
        $("#bt_new_note").show();
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
        this.display_iframe("Loading");
        this.display_title("Loading");
    };
    
    this.display_login_dialog = function (){
        DIALOG_LOGIN = new Dialog($("#dialog_login").html(), {title:"设置aliyun验证信息"});
        DIALOG_LOGIN.show();
    };
    
    this.close_login_dialog = function(){
        DIALOG_LOGIN.close();
    };
    
    this.display_create_note = function(){
        this.behavior.display_vew = DisplayView.creating;
        editor.setShow();
        editor.setContent("");
        console.log('new notes');
        $("#display_title").hide();
        $("#bt_edit_note").hide();
        $("#bt_save_note").show();
        $("#input_title").show();
        $("#input_title").val("");
        $("#iframe").contents().find("body").hide();
    };
    this.display_read_note = function(divid){
        this.behavior.display_vew = DisplayView.reading;
        var div = $('#' + divid);
        this.display_title(div.find('h2').html());
        this.display_iframe("<strong>Loading...</strong>");
        $("#bt_save_note").hide();
        $("#bt_edit_note").show();
        $("#bt_delete_note").show();
        $(".note_list").removeClass().addClass("note_list");
        $('#' + divid).addClass("note_list this");
    };
    this.display_history = function(divid){
        $("#bt_history").show();
        var div = $('#' + divid);  
        var history = div.attr("history").split(";");
        $("#history_list").empty();
        var tmpl = '<li><a href="#" onclick="get_history(\'{0}\',\'{1}\')">{2}</a></li>';
        $("#history_list").append(tmpl.format(divid, div.attr("objkey"), "最新版本"));
        for(var i in history){
            if (history[i]){
                var d = new Date(parseFloat(history[i]) * 1000);
                var date = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
                var key = NOTES_HISTORY_PREFIX + history[i];
                $("#history_list").append(tmpl.format(divid, key, date));
            }
        }
        $("#history_list").append('<li class="divider"></li><li><a href="#">取  消</a></li>');
    };
    this.display_save_note = function(title){
        BEHAVIOR.display_vew = DisplayView.saving;
        $("#bt_save_note").hide();
        DISPLAY.display_title(title);
        DISPLAY.display_iframe("<strong>Saving note....</strong>");
    };
    this.display_edit_note = function(divid){
        this.behavior.display_vew = DisplayView.editing;
        var div = $('#' + divid);
        $("#input_title").val(div.find('h2').html());
        $("#bt_edit_note").hide();
        $("#bt_save_note").show();
        $("#input_title").show();
        $("#display_title").hide();
        editor.setShow();
        var body = $("#iframe").contents().find("body");
        editor.setContent(body.html());
        body.empty();
        body.hide();
    };
    this.display_login = function(owner){};
    this.display_logout = function(){
        $("#owner").html("Logouting");
        this.show_login_dialog();
        this.display_iframe("Unlogin");
        this.display_title("Unlogin");
        $("#bt_login").show();
        $("#bt_logout").hide();
        $("#bt_new_note").hide();
        $("#bt_edit_note").hide();
        $("#bt_delete_note").hide();
    };
    this.display_no_selected = function(){
        this.behavior.selected_note_key = null;
        this.display_iframe("");
        this.display_title("");
        $("#bt_edit_note").hide();
        $("#bt_delete_note").hide();
    };
    this.display_normal = function(){
        this.behavior.current_folder = DisplayView.normal;
        this.display_no_selected();
        $("#bt_new_note").show();
        $(".folder").removeClass().addClass("folder");
        $("#folder_all_notes").addClass("folder this");
    };
    this.display_trash = function(){
        this.behavior.current_folder = DisplayView.trashing;
        this.display_no_selected();
        $("#bt_new_note").hide();
        $(".folder").removeClass().addClass("folder");
        $("#folder_trash").addClass("folder this");
    };
    this.display_note = function(contents){
        switch(this.behavior.display_vew){
        case DisplayView.creating:break;
        case DisplayView.editing:
            editor.setContent(contents);
            break;
        case DisplayView.reading:
        default:
            this.display_iframe(contents);
        }
    };
};

function Behavior(){
    this.selected_note_key = false;
    this.display_vew = null;
    this.current_folder = DisplayView.normal;
}

var BEHAVIOR = new Behavior();
var DISPLAY = new Display(BEHAVIOR);

function login(){
    var url = 'actions/login.php';
    
    if($("#access_id").val().length < 10 || $("#access_key").val() < 10 || $("#host").val() < 10){
        console.log($("#access_id").val());
        console.log($("#access_key").val());
        console.log($("#host").val());
        return;
    }

    BEHAVIOR.selected_note_key = null;

    $.post(url , {access_key:$("#access_key").val(),
                  access_id:$("#access_id").val(),
                  host:$("#host").val(), } , function(response)
    {
        try{
            JSON.parse(response);
        }catch(e){
            console.error(e);
            console.log(response);
            return on_http_status_not_200(response);
        }

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

    BEHAVIOR.selected_note_key = null;
    display.display_logout();
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
    if (BEHAVIOR.selected_note_key == divid)
        return;
    BEHAVIOR.selected_note_key = divid;

    DISPLAY.display_read_note(divid);
    DISPLAY.display_history(divid);
    OSS.get_object(object_key, function(resp){
        DISPLAY.display_note(resp);
    });
    console.log('call get object', object_key);
}

function new_note(){
    BEHAVIOR.selected_note_key = null;
    DISPLAY.display_create_note();
}

function delete_note(){
    if (BEHAVIOR.selected_note_key == null)
        return;
    var div = $('#' + BEHAVIOR.selected_note_key);
    var object_key = div.attr("objkey");
    if (typeof object_key === "undefined"){
        console.log('undefined note', BEHAVIOR.selected_note_key);
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
    if (BEHAVIOR.selected_note_key == null)
        return;
    DISPLAY.display_edit_note(BEHAVIOR.selected_note_key);
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
    if(BEHAVIOR.selected_note_key == null){
        object_key = NOTES_FOLDER_PREFIX + now.getTime();
        console.log("creating a new note", object_key);
    } else {
        var div = $('#' + BEHAVIOR.selected_note_key);
        object_key = div.attr("objkey");
        history = div.attr("history");
        if (typeof object_key === "undefined") {
            console.log('undefined note', BEHAVIOR.selected_note_key, div);
            return;
        }
        console.log("changing a old note", object_key);
    }

    DISPLAY.display_save_note(title);

    OSS.copy_put_object(object_key, title, txt, content, history,
    function(res){
        DISPLAY.display_note(content);
        var lastmodified = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
        if (BEHAVIOR.selected_note_key == null){
            // 新建保存
            $("#all_notes_list").prepend(
                NOTES_LIST_TEMPLATE.format(Math.random().toString().substr(2), object_key, "",
                    title, lastmodified, txt));
        } else {
            var div = $('#' + BEHAVIOR.selected_note_key);
            div.empty();
            div.append("<h2>{0}</h2><p><strong>{1}</strong><span>&nbsp;&nbsp;{2}</span></p>".format(title, lastmodified, txt));
            div.attr("history", res.header["x-oss-meta-history"]);
        }
    });
}

function get_trash(){
    if(BEHAVIOR.current_folder == DisplayView.trashing)
        return;
    DISPLAY.display_trash();
    OSS.get_bucket(NOTES_TRASH_PREFIX, init_notes_folder);
}

function get_notes(){
    if(BEHAVIOR.current_folder == DisplayView.normal)
        return;
    DISPLAY.display_normal();
    OSS.get_bucket(NOTES_FOLDER_PREFIX, init_notes_folder);   
}

function init_notes_folder(resp){
    // common_prefix是带斜杠'/'结束的，为文件夹. type is Array;
    // var common_prefix = res.listbucketresult.commonprefixes;
    // contents是文件. type is Array
    var res = xmlToJson.parser(resp.body);
    var contents = res.listbucketresult.contents;
    if (typeof contents === "undefined"){
        console.log(res);
        return;
    }

    $("#all_notes_list").empty();
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
}

/* 初始化过程
* 1)新建设一个bucket为: NOTES_BUCKET
* 2)NOTES_BUCKET 下新建两个文件夹：NOTES_FOLDER_PREFIX，NOTES_TRASH_PREFIX
* 3)NOTES_FOLDER_PREFIX 下新建一个文件
*/
function init_service(response)
{
    try{
        response = JSON.parse(response);
    }catch(e){
        console.log(response);
        return show_login_dialog();
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

    function init_folder(){
        OSS.put_object(NOTES_FOLDER_PREFIX, NOTES_FOLDER_PREFIX, "all notes will save at this prefix", "folder", function(res){
                var object_key = Math.random().toString().substr(2);
                var frist_title = "the frist notes";
                var frist_content = "the frist notes created by Aliyun Notes.";
                OSS.put_object(NOTES_BUCKET, NOTES_FOLDER_PREFIX + object_key, frist_title, frist_content, frist_content, function(res){
                    OSS.get_bucket(NOTES_FOLDER_PREFIX, init_notes_folder);
                });
            });
    	OSS.put_object(NOTES_TRASH_PREFIX, NOTES_TRASH_PREFIX, "all trash notes will save at this prefix", "folder");
    }

    if (!has_notes_bucket){
        OSS.create_bucket(NOTES_BUCKET, "private", function(response){
            iOSS.get_bucket(NOTES_FOLDER_PREFIX, init_notes_folder);
        });
    } else {
        OSS.get_bucket(NOTES_FOLDER_PREFIX, init_notes_folder);
        return;
        OSS.get_bucket('', function(resp){
            var res = xmlToJson.parser(resp.body);
            // common_prefix是带斜杠'/'结束的，为文件夹. type is Array;
            var common_prefix = res.listbucketresult.commonprefixes;
            if(typeof common_prefix === 'undefined'){
                return init_folder();
            }
            var find_notes_folder_perfix = false;
            var find_notes_trash_perfix = false;
            for (var key in common_prefix){
                if (common_prefix[key].prefix == NOTES_FOLDER_PREFIX){
                    find_notes_folder_perfix = true;
                    continue;
                }
                if (common_prefix[key].prefix == NOTES_TRASH_PREFIX){
                    find_notes_trash_perfix = true;
                    continue;
                } else {
                    console.log(common_prefix[key].prefix);
                }
            }
            if (!find_notes_folder_perfix || !find_notes_trash_perfix){
                return init_folder();
            } else {
                OSS.get_bucket(NOTES_FOLDER_PREFIX, init_notes_folder);
            }
        });
    }
}

function init_notes(){
    OSS.init(init_service);
}

