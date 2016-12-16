var $progr = $("#progress");
var $notFound = $("#not-found");
$progr.hide();
$notFound.hide();
var is_serching = false;

$result_template_text = `
<div>
    <div class="thumbnail">
        <a href="" target="_blank" class="link">
            <img src="" class="avatar">
            <div class="caption">

            </div>
        </a>
    </div>
</div>
`;

function startSerch(from, to){
    
    var socket = io();
    var $progress = $("#progress div");
    $("#result_screen").html("");
    $notFound.hide();
    
    $progr.show();

    socket.on('disconnect',function(){
        console.log("Disconnected");
        socket.close();
    });

    socket.on('serchResultEvent', function (data) {
        try{
            data = JSON.parse(data);
            if(data && data.length > 0){
                draw_users(data);
            }
            else{
                $notFound.show();
            }
        }
        catch(exception) {
            alert("На жаль, сталась помилка на сервері! Спробуйте ще раз.");
        }
        $progr.hide();
    });

    socket.on('serchInProgressEvent',function(data){
        var percents = get_percentage(+data,5000);
        $progress.css("width",percents);
        $progress.text(percents);
    });

    $("#stop_button").click(function(){
        socket.emit('stopSerchEvent',{});
        socket.close();
    });

    socket.emit('serchEvent', {
        start:+from,
        destination:+to
    });
}

function validate_and_start(){
    var from = $("#from").val();
    var to = $("#to").val();
    var id_regexp = /\d+/i;
    if(!id_regexp.test(from) || !id_regexp.test(to)){
        alert("Повинні бути цифрові ідентифікатори!");
        return;
    }
    if(from == to){
        alert("Спробуйте ввести різні ідентифікатори :)");
        return;
    }
    users = from+","+to;
    $.ajax({
            url: "https://api.vk.com/method/users.get?user_ids="+users+"&v=5.52",
            dataType: "jsonp",
            jsonp: "callback",    
            success: function(data){
                console.log(data);
                if(data.error) {
                    alert("Ні одного ідентифікатора не існує!");
                    return;
                }
                if(data.response.length < 2) {
                    alert("Якийсь ідентифікатор неправильний!");
                    return;
                }
                if(data.response[0].deactivated || data.response[1].deactivated) {
                    alert("Хтось з них деактивований!");
                    return;
                }
                $notFound.find(".name1").text(data.response[0].first_name+" "+data.response[0].last_name);
                $notFound.find(".name2").text(data.response[1].first_name+" "+data.response[1].last_name);
                startSerch(from, to);
            }
    });
    
}

$("#start_button").click(validate_and_start);
$("#from").blur(function(event){
    $this = $(this);
    make_id($this);
});
$("#to").blur(function(event){
    $this = $(this);
    make_id($this);
});

function get_percentage(number, base){
    var res = ((number/base)*100)+"";
    var re = /\d\d?\.?\d?\d?/i;
    res = res.match(re);
    return res ? res[0]+"%" : "100%";
}

function draw_users(users){
    var len = users.length;
    $screen = $("#result_screen");
    $screen.html("");
    var block_size = parseInt(12/len);
    for(var i = 0; i < len;++i){
        $result_template = $($result_template_text);
        $result_template.attr("id","user"+users[i]);
        $result_template.addClass("col-sm-"+block_size);
        $screen.append($result_template);
        $.ajax({
            url: "https://api.vk.com/method/users.get?user_id="+users[i]+"&fields=photo_200,name&v=5.52",
            dataType: "jsonp",
            jsonp: "callback",    
            success: function(data){
                console.log(data);
                data = data.response[0];
                if(data.deactivated){
                    $result.find(".avatar").attr("src","images/banned.jpg");
                    return;
                }
                $result = $("#user"+data.id);
                $result.find("a").attr("href", "https://vk.com/id"+data.id);
                if(data.photo_200){
                    $result.find(".avatar").attr("src",data.photo_200);
                }
                else{
                    $result.find(".avatar").attr("src","images/no_avatar.gif");
                }
                $result.find(".caption").text(data.first_name+" "+data.last_name);
            }
        });
    }
}

function make_id($element){
    is_serching = true;
    var ids = $element.val();
    $.ajax({
        url: "https://api.vk.com/method/users.get?user_ids="+ids+"&v=5.52",
        dataType: "jsonp",
        jsonp: "callback",    
        success: function(data){
            console.log(data)
            if(data.error){
                console.log(data.error);
                $("#"+$element.attr("id")+"_name").text("id");
                $element.val("");
                return;
            }
            data = data.response[0];
            $("#"+$element.attr("id")+"_name").text(data.first_name+" "+data.last_name);
            $element.val(data.id);
            console.log(data.first_name+" "+data.last_name);
            is_serching = false;
        }
    });
}