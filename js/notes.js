String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,                
        function(m,i){
            return args[i];
        });
}

var NOTES_BUCKET ="notes_bucket";
var NOTES_FOLDER_PREFIX = "notes_folder/";
var NOTES_TRASH_PREFIX = "notes_trash/";
var NOTES_LIST_TEMPLATE = '<div class="note_list" id="{0}" title="{1}" onclick="onclick_get_object(\'{0}\',\'{1}\')"><h2>{2}</h2><p><strong>{3}</strong><span>&nbsp;&nbsp;{4}</span></p></div>';

function on_http_status_not_200(response){
    if (response.status == 403){
        console.log(response);
        return show_login_dialog();
    }
    console.error(response.status);
    console.error(response.body);
}

var DIALOG_LOGIN = null;
function show_login_dialog(){
    DIALOG_LOGIN = new Dialog($("#dialog_login").html(), {title:"设置aliyun验证信息"})
    DIALOG_LOGIN.show();
}

function login(){
    var url = 'actions/login.php';
    if($("#access_id").val().length <10 ||$("#access_key").val()<10 || $("#host").val()<10){
        console.log($("#access_id").val());
        console.log($("#access_key").val());
        console.log($("#host").val());
        return;
    }

    $.post(url , {access_key:$("#access_key").val(),
                  access_id:$("#access_id").val(),
                  host:$("#host").val(),} , function(response)
    {  
        DIALOG_LOGIN.close();
        try{
            var res = JSON.parse(response);
        }catch(e){
            if (res.status / 100 != 2){
                return on_http_status_not_200(response);
            }
        }

        init_service(response);       

    },"html");
}

function logout(){
    var url = 'actions/logout.php';
    $.post(url , {access_key:$("#access_key").val(),
                  access_id:$("#access_id").val(),
                  host:$("#host").val(),} , function(response)
    {  
        console.log(response);
        $("#owner").html("Unlogin");        
    },"html");
    show_login_dialog();
    display_iframe("Unlogin");
    display_title("Unlogin");
    $("#all_notes_list").empty();
    $("#bt_login").show();
    $("#bt_logout").hide();
    $("#bt_new_note").hide();
}

function create_bucket(bucket, acl, callback) {
    var url = "actions/create_bucket.php";
    if (typeof(acl) == "undefined"){
        acl = "private";
    }

    $.post( url , {"bucket":bucket, "acl":acl}, function( response )
    {
        var response = JSON.parse(response);
        if (response.status / 100 != 2){
            return on_http_status_not_200(response);
        }
        
        console.log("created bucket:" + bucket);
        callback(response)

    } , 'html' );
}

function get_bucket(bucket, prefix, callback){
    
    var url = 'actions/get_bucket.php';
    $.post(url , {"bucket":bucket, "prefix":prefix}, function( response )
    {
        var response = JSON.parse(response);
        if (response.status / 100 != 2){
            return on_http_status_not_200(response);
        }
        
        var res = xmlToJson.parser(response.body);
        if(typeof callback != "undefined")
            callback(res);
        else
            console.log("get_bucket", bucket, prefix, res);

    } , 'html' );
}

function display_title(title){
    $("#input_title").hide();
    $("#display_title").show();
    $("#display_title").empty();
    $("#display_title").append(title);
    $("#bt_new_note").show();
}

function display_iframe(contents){
    editor.setHide();
    var body = $("#iframe").contents().find("body");
    body.show();
    body.empty();
    body.append(contents);
}

function display_owner(owner){
    $("#owner").html(owner);
    $("#owner").show();
    $("#bt_logout").show();
    $("#bt_login").hide();
    display_iframe("Loading");
    display_title("Loading");
}

var SELECT_ARTICLE = null;
function onclick_get_object(divid, object_key){
    //TODO: 如果 div的class已经是"note_list this" 则直接返回
    if (SELECT_ARTICLE == divid)return;
    SELECT_ARTICLE = divid;
 
    var div = $('#'+ divid);
            
    $("#bt_edit_note").hide();
    $("#bt_save_note").hide();
        
    display_title(div.find('h2').html());
    display_iframe("<strong>loading...</strong>")
    
    $(".note_list").removeClass().addClass("note_list")
    $('#'+ divid).addClass("note_list this");

    console.log('call get object', object_key);
    
    var url = 'actions/get_object.php';
    $.post(url , {"bucket":NOTES_BUCKET, "object":object_key}, function(response)
    {   
        display_iframe(response);
        $("#bt_edit_note").show();
        //(response);
        // TODO：设置div的class为"note_list this" 
    } , 'html' );
}

function new_notes(){
    SELECT_ARTICLE = null;
    editor.setShow();
    $("#editor").show()
    editor.setContent("");
    console.log('new notes');
    $("#display_title").hide(); 
    $("#bt_edit_note").hide();
    $("#bt_save_note").show();
    $("#input_title").show();
    $("#input_title").val("");
    $("#iframe").contents().find("body").hide();
}

function edit_notes(){
    if (SELECT_ARTICLE == null)return;
    var div = $('#'+ SELECT_ARTICLE);
    var body = $("#iframe").contents().find("body");

    $("#bt_edit_note").hide();
    $("#bt_save_note").show();
    $("#input_title").show();
    $("#display_title").hide();
    $("#input_title").val(div.find('h2').html());
    body.hide();
        
    editor.setShow();
    $("#editor").show()
    editor.setContent(body.html());
    body.empty();
}

function save_notes(){

    console.log('save notes');
    var title  = $("#input_title").val();
    var txt = editor.getContentTxt().substr(0, 128);
    var content = editor.getContent();
    if (title.length <= 1){
        title ="Untitled"
    }
    if(txt.length < 1 || content.length < 1){
        alert("空内容");
        return;
    }
    var now = new Date();
    if(SELECT_ARTICLE == null){
        //create a new note
         
        var object_key = NOTES_FOLDER_PREFIX + now.getTime();
        console.log("creating a new note", object_key);
    }else{
        var div = $('#'+ SELECT_ARTICLE);
        var object_key = div.attr("title");
        if (typeof object_key === "undefined"){
            console.log('undefined article', SELECT_ARTICLE, div);
            return;
        }
        console.log("changing a old note", object_key);
        //TODO: 生成历史版本
    }

    var body = $("#iframe").contents().find("body");

    $("#bt_edit_note").hide();
    $("#bt_save_note").hide();
    display_title(title);

    display_iframe("<strong>Saving note....</strong>");

    put_object(NOTES_BUCKET, object_key,
        title, txt, content, function(res){
            $("#bt_edit_note").show();
            display_iframe(content);
            display_title(title);
            var lastmodified = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate();
            if (SELECT_ARTICLE == null){
                $("#all_notes_list").prepend(
                    NOTES_LIST_TEMPLATE.format(Math.random().toString().substr(2), object_key,
                                               title,lastmodified,txt)
                    );
            } else{
                var div = $('#'+ SELECT_ARTICLE);
                div.empty()
                div.append("<h2>{0}</h2><p><strong>{1}</strong><span>&nbsp;&nbsp;{2}</span></p>".format(title,lastmodified,txt));
            }
        });
}

function put_object(bucket, object_key, title, disposition, content, callback){
    var url = 'actions/put_object.php';
    $.post(url , {"bucket":bucket, "object":object_key,
                  "title":title, "disposition":disposition,
                  "content":content}, function( response )
    {   
        var response = JSON.parse(response);
        if (response.status / 100 != 2){
            return on_http_status_not_200(response);
        }
     
        if (typeof callback != "undefined")
            callback(response);
        else
            console.log("put_object", object_key, response);

    } , 'html' );
}

function get_object_meta(bucket, object_key, callback){
    var url = 'actions/head_object.php';
    $.post(url , {"bucket":bucket, "object":object_key}, function(response)
    {   
        var response = JSON.parse(response);
        if (response.status / 100 != 2){
            return on_http_status_not_200(response);
        }
        if (typeof callback != "undefined")
            callback(response);
        else
            console.log("get_object_meta", object_key, response);
        
    } , 'html' );
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

    if (response.status / 100 != 2){
        return on_http_status_not_200(response);
    }

    var res = xmlToJson.parser(response.body);
    var buckets = res.listallmybucketsresult.buckets.bucket;
    var owner = res.listallmybucketsresult.owner;
    
    display_owner(owner.displayname);
    console.log(owner.id, owner.displayname);

    var has_notes_bucket = false;
    for(var key in buckets){
        console.log(buckets[key].name, buckets[key].creationdate);
                    
        if(buckets[key].name == NOTES_BUCKET){
            has_notes_bucket = true;
            break;
        }
    }
    function init_notes_folder(res){
        // common_prefix是带斜杠'/'结束的，为文件夹. type is Array;
        var common_prefix = res.listbucketresult.commonprefixes;
        // contents是文件. type is Array
        var contents = res.listbucketresult.contents;
        if (typeof contents ==="undefined"){
            console.log(res);
            return;
        }

        
        $("#all_notes_list").empty(); 
        function add_object_to_view(obj)
        {
            if(obj.key.substr(-1) != "/")
            {   
                get_object_meta(NOTES_BUCKET, obj.key, function(res)
                {
                    headers = res.header;
                    $("#all_notes_list").append(
                        NOTES_LIST_TEMPLATE.format(Math.random().toString().substr(2), obj.key,
                                                   headers["x-oss-meta-title"],
                                                   obj.lastmodified.substr(0, 10),
                                                   headers["x-oss-meta-disposition"])
                    );
                });
            }
        }
        if (contents.constructor === Array ){
            for(var key in contents){
                add_object_to_view(contents[key]);
            }
        }else{
            add_object_to_view(contents);
        }
    }

    function init_folder(){
            put_object(NOTES_BUCKET, NOTES_FOLDER_PREFIX, NOTES_FOLDER_PREFIX, "all notes will save at this prefix", "folder", function(res){
                var object_key = Math.random().toString().substr(2);
                var frist_title = "the frist notes";
                var frist_content = "the frist notes created by Aliyun Notes.";
                put_object(NOTES_BUCKET, NOTES_FOLDER_PREFIX + object_key, frist_title, frist_content, frist_content, function(res){
                    get_bucket(NOTES_BUCKET, NOTES_FOLDER_PREFIX, init_notes_folder);
                });
            });
        put_object(NOTES_BUCKET, NOTES_TRASH_PREFIX, NOTES_TRASH_PREFIX, "all trash notes will save at this prefix", "folder");
    }

    if (!has_notes_bucket){
        create_bucket(NOTES_BUCKET,"private", function(response){
            init_folder();
        });
    } else {
        get_bucket(NOTES_BUCKET, '', function(res){
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
                get_bucket(NOTES_BUCKET, NOTES_FOLDER_PREFIX, init_notes_folder);
            }

            
        });

    }
}
function init_notes(){
    var url = 'actions/get_service.php';
    $.post(url , {} ,  init_service, 'html' );
}
