(function () {
	var $body = $('body');
	var $addUrl = $('.j_AddUrl');
	var $urlBox = $('.j_UrlBox');
	var $checkAll = $('.j_CheckAll');
	var $dataContent = $('.j_DataContent');
	var $runTimeSelect = $('.j_RunTimeSelect');
	var $startWatch = $('.j_StartWatch');
	var $endWatch = $('.j_EndWatch');
	var $remainTime = $('.j_RemainTime');
	var $watchForm = $('.j_WatchForm');
	var $waitForContent = $('.j_WaitForContent');
	var $checkAllInfo = $('.j_CheckAllInfo');

	var saveUrlClass = '.j_SaveUrl';
	var cancelUrlClass = '.j_Cancel';
	var fixUrlClass = '.j_FixUrl';
	var deleteUrlClass = '.j_DeleteUrl';
	var valueUrlClass = '.j_ValueUrl';

	function showLoading () {
		$waitForContent.show();
	}

	function hideLoading () {
		$waitForContent.hide();
	}

	function ajaxSaveUrl (url) {
		$.ajax({
			dataType: 'json',
			url: '/api/saveUrl',
			type: 'post',
			data: {
				url: url
			},
			success: function (data) {
				Bass.reload();
			}
		})
	}
	function ajaxDelUrl (url) {
		$.ajax({
			dataType: 'json',
			url: '/api/delUrl',
			type: 'post',
			data: {
				url: url
			},
			success: function (data) {
				Bass.reload();
			}
		})
	}
	function ajaxCheckAll () {
		var urlArr = [];
		$(valueUrlClass).each(function(i, item) {
			urlArr.push($(item).html());
		})
		var urlAllToString = '';
		$.ajax({
			dataType: 'json',
			url: '/api/checkAll',
			type: 'post',
			data: {
				url: urlArr.toString()
			},
			success: function (data) {
				hideLoading();
				var html = template('J_TempDataComplete', data);
				$dataContent.append(html);
			}
		})
	}
	function ajaxCheckAllInfo () {
		var urlArr = [];
		$(valueUrlClass).each(function(i, item) {
			urlArr.push($(item).html());
		})
		var urlAllToString = '';
		$.ajax({
			dataType: 'json',
			url: '/api/checkAllInfo',
			type: 'post',
			data: {
				url: urlArr.toString()
			},
			success: function (data) {
				hideLoading();
				var html = template('J_TempDataInfo', data);
				$dataContent.append(html);
			}
		})
	}
	function addUrlBox () {
		var html = template('J_TempUrlEdit', {
			valueUrl: 'http://',
			status: 0
		});
		$urlBox.append(html);	
	}
	function saveUrl () {
		var valueUrl = $(this).siblings('.j_UrlInput').val();
		var html = template('J_TempUrlFix', {
			valueUrl: valueUrl
		});
		$(this).parents('.j_Url').html('').append(html);

		// mongodb
		ajaxSaveUrl(valueUrl);
	}
	function cancelUrl () {
		var valueUrl = $(this).siblings('.j_UrlInput').data('origin'),
			html     = '';
		if ($(this).data('status') === 0) {
			$(this).parents('.j_Url').remove();	
		} else if ($(this).data('status') === 1) {
			html = template('J_TempUrlFix', {
				valueUrl: valueUrl
			})
			$(this).parents('.j_Url').html(html);
		}
		
	}
	function fixUrl () {
		var valueUrl = $(this).siblings('.j_ValueUrl').html();
		var html = template('J_TempUrlEdit', {
			valueUrl: valueUrl,
			status: 1,
			origin: valueUrl
		});
		$(this).parents('.j_Url').after(html);
		$(this).parents('.j_Url').remove();

		// TODO mongodb
	}
	function deleteUrl () {
		var valueUrl = $(this).siblings('.j_ValueUrl').html();
		if (window.confirm('确认删除？')) {
			$(this).parents('.j_Url').remove();	
			ajaxDelUrl(valueUrl);
		}
		
	}
	function startWatch () {
		// var timeValue = $runTimeSelect.val();
		$watchForm[0].action = $(this).data('action');
		console.log($watchForm[0].action);
		$watchForm.submit();
	}


	$addUrl.on('click', function () {
		addUrlBox();
	});
	$checkAll.on('click', function () {
		showLoading();
		ajaxCheckAll();
	})
	$checkAllInfo.on('click', function () {
		showLoading();
		ajaxCheckAllInfo();
	})
	$startWatch.on('click', function () {
		startWatch.call(this);
	})


	$body.on('click', saveUrlClass, function () {
		saveUrl.call(this);
	});
	$body.on('click', cancelUrlClass, function () {
		cancelUrl.call(this);
	});
	$body.on('click', fixUrlClass, function () {
		// fixUrl.call(this);
		alert('sorry! 修改功能未完善 暂不开放!')
	});
	$body.on('click', deleteUrlClass, function () {
		deleteUrl.call(this);
	})




})()




