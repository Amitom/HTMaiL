(function($){
$(document).ready(function(){
	var $canvas = {canvas: $('canvas#render')[0], wrapper: $('#canvaswrapper').first(), context: null, file : null, img : null, rules : $('#ruleswrapper').first()};
	// ==========================
	// Load the template
	// ==========================
	$('form[action=upload]').on('submit',function(e){
		e.preventDefault();
		var fr = new FileReader();
		var loadingResult = loadImg(document.querySelector('#templatefile').files[0]);
		$('.alert',this).alert(loadingResult.alert,loadingResult.state);
		// Img loading
		fr.onload = function(){
			// Canvas init
			$canvas.file = loadingResult.file;
			$canvas.context = $canvas.canvas.getContext("2d");
			// Start drawing
			$canvas.img = new Image;
		    $canvas.img.onload = function() {
		       	$('.alert','#drawingzone').alert("<strong>Image informations : </strong>"+ $canvas.file.name + " - height : " + $canvas.img.height + "px - width : " + $canvas.img.width + "px" ,"info");
				$canvas.canvas.width = $canvas.img.width;
				$canvas.canvas.height = $canvas.img.height;
				$canvas.context.drawImage($canvas.img,0,0);
				$canvas.wrapper.width($canvas.img.width);
                $('form[action=addrule]').slideDown(500);
                $('form[action=cut]').slideDown(500);
		    };		    
		    $canvas.img.src = fr.result;
		}
		if(loadingResult.file)
			fr.readAsDataURL(loadingResult.file);
		// ==========================
		return false;
	});
	// ==========================
	// Create rules
	// ==========================
    //Functions
    var addRule = function(isHorizontal){
        var $rh = $('<li class="rule rh" style="top:50%"></li>'),
            $rv = $('<li class="rule rv" style="left:50%"></li>');
        $canvas.wrapper.children("#ruleswrapper").children('.editable').removeClass('editable');
        (isHorizontal?$rh:$rv).appendTo($canvas.wrapper.children("#ruleswrapper")).click();
    }
    //Events
	$('form[action=addrule]').on('submit',function(e){
		e.preventDefault();
		// ==========================
		var side = "",
			sideOptions = this.side;
		for(i=0,n=sideOptions.length;i<n;i++){
			if(sideOptions[i].checked){
				side = sideOptions[i].value;
			}
		}
		$('.alert',this).alert("","hidden");
        switch(side){
            case "h": addRule(true);break;
            case "v": addRule(false);break;
            default : $('.alert',this).alert("Please select a side","warning");
        }
		// ==========================
		return false;
	});
    // ==========================
    // Remove rules
    // ==========================
    // Function
    var removeRules = function(_selected){
        _selected = _selected || false;
        var choice = false;
        if(_selected){
            choice = confirm("Confirm selected rule suppression ?") ? $('.rule.editable').remove() : ''
        }
        else{
            choice = confirm("All rules will be removed, continue ?") ? $('.rule').remove() : ''
        }
        choice ? $('form[action=setrule]').slideUp(500) : '';
    }
    // Events
    $('form[action=setrule]').on('submit',function(e){
        e.preventDefault();
        removeRules(true);        
        return false;
    });
    $('#removeallrules').on('click',function(){
        removeRules();
    });
    // ==========================
    // Move rules
    // ==========================
    // Functions
    var deselectRules = function(_hidePanel){
        $canvas.rules.children().removeClass('editable');
        _hidePanel ? $('form[action=setrule]').slideUp(500) : $('form[action=setrule]').slideDown(500);
    }
    var newPositionRule = function(_container,_event){
        var newPosX = 0;
        var newPosY = 0;
        newPosX = (_event.pageX-_container.offset().left)*100/parseInt(_container.width());
        newPosY = (_event.pageY-_container.offset().top)*100/parseInt(_container.height());
        newPosX > 100 ? newPosX = 100 : "";
        newPosX < 0 ? newPosX = 0 : "";
        newPosY > 100 ? newPosY = 100 : "";
        newPosY < 0 ? newPosY = 0 : "";
        return {X:newPosX,Y:newPosY};
    }
    var moveRule = function(_rule,_newcoord,_isPercent,_setInput){
        _setInput = _setInput || false;
        _isPercent = _isPercent || false;
        if(!_isPercent){
            _newcoord.X = parseInt(_newcoord.X*100/$canvas.img.width);
            _newcoord.Y = parseInt(_newcoord.Y*100/$canvas.img.height);
        }
        if(_rule.is('.rv')){
            _newcoord.Y = 0;
            _setInput ? $('#changeposition').val(parseInt(_newcoord.X*$canvas.img.width/100)) : '';
        }else{
            _newcoord.X = 0;
            _setInput ? $('#changeposition').val(parseInt(_newcoord.Y*$canvas.img.height/100)) : '';
        }
        _rule.css({top:_newcoord.Y + "%",left:_newcoord.X + "%" });
    }
    // Events
	var oldValue = 0;
	$('#changeposition').on({
		'keydown':function(e){
			oldValue = parseInt($(this).val());		
		},'keyup':function(e){
            var $t = $(this),
			     $val = $t.val();
			$('.rule.editable').each(function(){
				var max = $(this).is('.rv') ? $canvas.img.width : $canvas.img.height;
				if(isNaN($val) || $val >= max || $val < 0){
					$t.val(oldValue);
				}
				else{
					moveRule($(this),{X:$val,Y:$val},false,false);
				}				
			});
		}
	});
	$('#ruleswrapper').on('click',function(e){
		e.stopPropagation();
        deselectRules(true);
		
	});
	$('#ruleswrapper').on('click','.rule',function(e){
		e.stopPropagation();
		deselectRules(false);
        $(this).addClass('editable');
		// Set input
		if($(this).is('.rv')){
				$('#changeposition').val(parseInt($(this)[0].style.left.replace('%','')*$canvas.img.width/100));
		}else{
				$('#changeposition').val(parseInt($(this)[0].style.top.replace('%','')*$canvas.img.height/100));
		}
	});
	$('#ruleswrapper').on('mousedown','.rule',function(){
		$(this).addClass('selected');
		$(this).parent().addClass('onmove');
	});
	$('#ruleswrapper').on('mouseup',function(){
		$(this).children().removeClass('selected');
		$(this).removeClass('onmove');
	});
	$('#ruleswrapper').on('mousemove',function(e){
		var newPos = newPositionRule($(this),e);
		$('.rule.selected',this).each(function(){
			moveRule($(this),newPos,true,true);
		});
	});
	// ==========================
	// Cut image
	// ==========================
    var generateImageTable = function(){
        var imgDim = {w:$canvas.img.width,h:$canvas.img.height}
        var th = [0,imgDim.h];
        var tv = [0,imgDim.w];
        $('#imageswrapper').fadeIn(300);
        $('.rule.rh').each(function(){
            th.push(parseInt(imgDim.h*$(this)[0].style.top.replace('%','')/100));
        });
        $('.rule.rv').each(function(){
            tv.push(parseInt(imgDim.w*$(this)[0].style.left.replace('%','')/100));
        });
        th.sort(function(a,b){return a-b});
        tv.sort(function(a,b){return a-b});
        $('#imageswrapper tbody').html('');
        //Generate TR
        for(i=0,n=th.length;i<n-1;i++){
            var $row = $('<tr/>');
            // Generate TD
            for(j=0,m=tv.length;j<m-1;j++){
                var _width = parseInt(tv[j+1] - tv[j]),
                    _height = parseInt(th[i+1] - th[i]);
                var $cell = $('<td width="'+ _width +'" height="'+ _height +'" data-setcell="0"></td>'),
                canvascell = document.createElement('canvas'),
                imagecell = new Image();
                canvascell.width = _width;
                canvascell.height = _height;
                ctxcanvascell = canvascell.getContext('2d');
                ctxcanvascell.drawImage($canvas.img,tv[j],th[i],_width,_height,0,0,_width,_height);
                imagecell.src = canvascell.toDataURL();
                $cell.append($(imagecell).attr({class:"plainimg",height:_height,width:_width}));
                $row.append($cell);
            }
            $('#imageswrapper tbody').append($row);
        }
    }
	$('form[action=cut]').on('submit',function(e){
		e.preventDefault();
        $('form[action=setcell]').slideUp(500);
		generateImageTable();
        $('#generatehtml').val('');
        $('form[action=generateHTML]').slideDown(500);
		return false;
	});
    // ==========================
    // Set/Modify cell
    // ==========================
    $('form[action=setcell]').on('submit',function(e){
        e.preventDefault();
        // ==========================
        var option = 0;cellOptions = this.optionsCell;
        for(i=0,n=cellOptions.length;i<n;i++){
            if(cellOptions[i].checked){
                option = parseInt(cellOptions[i].value);
            }
        }
        var $img = $('#imageswrapper .currentcell').find('.plainimg');       
        switch(option){
            // 1 - Wrap image with a link
            case 1: 
                if($('#href',this).val() != ""){
                    var $a = $('<a href="'+ $('#href',this).val() +'"/>');
                    $img.removeClass('norendering');                
                    $img.wrap($a);
                }
                else{
                    return false;
                }
                break;
            // 2 - Replace image with custom HTML
            case 2: 
                var $customHTML = $('<div>'+ $('#customhtml').val() +'</div>');   
                $img.addClass('norendering');
                $img.parent().is('a') ? $img.unwrap() : $img.siblings().remove();          
                $img.after($customHTML);
                break;
            // 0 - Just an image : remove potential link and current siblings
            default: 
                $img.removeClass('norendering');
                $img.parent().is('a') ? $img.unwrap() : $img.siblings().remove();
        }
        $img.parents('td').attr('data-setcell',option);
        // ==========================
        return false;
    });
    $('#imageswrapper').on('click','td',function(e){
        e.stopPropagation();
        var $t = $(this);   
        deselectRules(true);     
        // ==========================
        if(!$t.is('.currentcell')){
            var state = parseInt($t.attr('data-setcell'));
            $t.parents('#imageswrapper').addClass('active').find('td.currentcell').removeClass('currentcell');
            $t.addClass('currentcell');
            $('form[action=setcell]').slideDown(500).find('input[value='+ state +']').click();
            switch(state){
                default: $('#href,#customhtml').val('');
                case 1: $('#href').val($t.children('a').attr('href'));break;
                case 2: $('#customhtml').val($t.children('div').html());break;                
            }
        }
        else{
            $t.removeClass('currentcell');
            $t.parents('#imageswrapper').removeClass('active')
            $('form[action=setcell]').slideUp(500);
        }
        // ==========================
        return false;
    });
    // ==========================
    // Set/Modify cell
    // ==========================
    var generateHTML = function(){
        var $table = $('.tablewrapper').clone();
        $table.find('.norender,.norendering').remove();
        return $table.html().trim();
    }
    $('form[action=generateHTML]').on('submit',function(e){
        e.preventDefault();
        // ==========================
        $('#generatehtml').val(generateHTML());
        // ==========================
        return false;
    });
});
// Functions
function loadImg(_file){
	// Test if image
	if(_file && _file["type"].search(/image\/(jpeg|gif|png)/i) > -1){
		return {file : _file,state : "success", alert : "Image successfully loaded"};
	}
	else{
		return {state : "danger", alert : "Please select a valid image. Supported format : jpeg, png, gif"};
	}
}
// End function
// jQuery functions
$.fn.alert = function(_message,_state){
	return this.each(function(){
		$t = $(this);
		$t.attr('class',$t.attr('class').replace(/alert\-[a-z]*/gi,''));
		$t.addClass('alert-'+ _state).html(_message);		
	});
}
// End jQuery functions
})(jQuery);