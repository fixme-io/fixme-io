var app = angular.module('myApp', [ "ngRoute", "ngStorage" ]);
var selected;

app.controller('MainCtrl', function($scope) {

	$scope.tasks = [];

});

app.controller('TasksCtrl', function($scope, $routeParams, $localStorage, $document) {
	
	angular.element(document).ready(function() {
		jQuery(".timeago").timeago();
	});
	
	// $localStorage.$reset();
	$scope.tasksId = $routeParams.ID;
	$scope.tasks = $localStorage.tasks ? $localStorage.tasks : [];
	
	$scope.add = function() {

		$scope.tasks.push({
			title : $scope.task,
			completed : false,
			dueDate : null,
			comments : [],
			priority : {
				title : "Medium",
				id : 2
			},
			createdOn : moment().format()   
		});

		$scope.task = '';

		$localStorage.tasks = $scope.tasks;
		
		angular.element(document).ready(function() {
			jQuery(".timeago").timeago();
		});
		
	}

	$scope.setId = function(priority) {
		if (priority.title == 'High') {
			priority.id = 1;
		} else if (priority.title == 'Low') {
			priority.id = 3;
		}
	}

	$scope.remainingTasks = function() {
		var remaining = 0;

		for (var i = 0; i < $scope.tasks.length; i++) {
			if (!$scope.tasks[i].completed) {
				remaining++;
			}
		}

		return remaining;
	}

	$scope.remove = function(index) {
		$scope.tasks.splice(index, 1);
	}
	
	$('#tasks').css( 'cursor', 'pointer' );
	
	var prevId;
	
	$scope.sortBy=function(filter,id){

		if(prevId!=null){
			$('tr th:nth-child(' + prevId + ')').css('color','black');
		}
		
		$scope.filter=filter;
		
		prevId=id;
		$('tr th:nth-child(' + id + ')').css('color','gray');
	}
	
	$scope.escape=function(){
		$scope.userSearch='';
	}

	$scope.selectedRow = selected;
	
	$scope.setClickedRow = function(index){
		$scope.selectedRow = index;
	}
	
});

app.directive('arrowSelector',['$document',function($document){
	return{
		restrict:'A',
		link:function($scope,elem,attrs,ctrl){
			var elemFocus = false;             
			elem.on('mouseenter',function(){
				elemFocus = true;
				$(this).css( 'cursor', 'pointer' )
		});
			$document.bind('keydown',function(e){
				if(elemFocus){
					if(e.keyCode == 38){
						if($scope.selectedRow == 0){
							return;
						}
						$scope.selectedRow--;
						$scope.$apply();
						e.preventDefault();
					}
					if(e.keyCode == 40){
						if($scope.selectedRow == $scope.tasks.length - 1){
							return;
						}
						$scope.selectedRow++;
						$scope.$apply();
						e.preventDefault();
					}
					if(e.keyCode == 13){
						window.location.href = '#edit/' + $scope.selectedRow;
						selected = $scope.selectedRow;
					}
				}
			});
		}
	};
}]);

app.config(function($routeProvider) {
	$routeProvider.when("/", {
		templateUrl : "tasks.html",
		controller : "TasksCtrl"
	}).when("/edit/:ID", {
		templateUrl : "edit.html",
		controller : "EditCtrl"
	}).when("/info", {
		templateUrl : "info.html",
		controller : "TasksCtrl"
	}).when("/:ID", {
		templateUrl : "tasks.html",
		controller : "TasksCtrl"
	});
});

app.controller("EditCtrl", function($scope, $routeParams, $localStorage) {
	
	$scope.tasks = $localStorage.tasks;
	$scope.index = $routeParams.ID;
	$scope.title = $scope.tasks[$scope.index].title;
	$scope.dueDate = $scope.tasks[$scope.index].dueDate;

	angular.element(document).ready(function() {
		jQuery(".timeago").timeago();
		$('.well').hide();
		$scope.hideComments();
		$scope.showAndHide();	
		$('#saveComment').hide();
	});

	$scope.update = function() {

		$scope.tasks[$scope.index].title = $scope.title;
		$scope.tasks[$scope.index].dueDate = $('#dueDate').val();
		
		if ($scope.comment != undefined && $scope.comment != '') {
			$scope.tasks[$scope.index].comments.push({
				comment : $scope.comment,
				date : moment().format(),
				edited : false,
				editedComments:[]
			});
		}
		
		$scope.showAndHide();
		$scope.hideComments();
		$scope.comment = '';

		$scope.tasks[$scope.index].lastChangedOn = moment().format();
		
		angular.element(document).ready(function() {
			$('.well').hide();
			jQuery(".timeago").timeago();
		});
		$('#nbComments').html($scope.tasks[$scope.index].comments.length);
	}

	$('#dueDate').daterangepicker({
		singleDatePicker : true,
		locale : {
			format : 'DD/MM/YYYY'
		}
	});
	
	$scope.editComment = function(index) {
		$('.timeline-centered').addClass('foo');
		$('.timeline-icon').hide();
		$('#form').hide();
		$('.media').hide();
		$('.action').hide();
		$('#' + index).show('slow');

		$scope.editComm = $scope.tasks[$scope.index].comments[index].comment;

		$('#addComment').hide();
		$('#saveComment').show();
		$('#more').hide();
		$('#hide').hide();
		$('#labelComments').html('');
		$('#nbComments').html('');
		
		$scope.updateEditedComment = function() {
			
			if($scope.editComm != $scope.tasks[$scope.index].comments[index].comment){
				$scope.tasks[$scope.index].comments[index].edited = true;
				$scope.tasks[$scope.index].comments[index].comment = $scope.editComm;
				$scope.tasks[$scope.index].comments[index].editedComments.push({title:$scope.editComm,editedDate:moment().format(),infoEdited:false});

				$scope.showAndHide();
				
				$('.media').show('slow');
				$('.action').show();
				$('#addComment').show();
				$('#saveComment').hide();
				
				$scope.editComm = '';
				
				if($scope.tasks[$scope.index].comments.length > 5){
					$('#more').hide();
					$('#hide').show();
				}
				
				angular.element(document).ready(function() {
					jQuery(".timeago").timeago();
				});
				$('#labelComments').html('Comments: ');
				$('#nbComments').html($scope.tasks[$scope.index].comments.length);
			}
		}
		
		$scope.cancel= function(){
			$('.media').show('slow');
			$('.action').show();
			$('#addComment').show();
			$('#saveComment').hide();
			$scope.editComm = '';
			
			if($scope.tasks[$scope.index].comments.length > 5){
				$('#more').hide();
				$('#hide').show();
			}
			
			$scope.showAndHide();
			$('#labelComments').html('Comments: ');
			$('#nbComments').html($scope.tasks[$scope.index].comments.length);
		}
	}
	
	$scope.deleteComment = function(index) {
		$scope.tasks[$scope.index].comments.splice(index, 1);

		for(var i = $scope.tasks[$scope.index].comments.length-5; i < $scope.tasks[$scope.index].comments.length; i++){
			$('#' + i).show();
		}
		
		if($scope.tasks[$scope.index].comments.length <= 5){
			$('#hide').hide();
			$('#more').hide();
		}else{
			$('#more').show();
		}
		
		$scope.showAndHide();
		
		$('#labelComments').html('Comments: ');
		$('#nbComments').html($scope.tasks[$scope.index].comments.length);
	}
	
	$scope.moreComments = function(){
		$('.media').show('slow');
		$('#more').hide();
		$('#hide').show();
		$scope.showAndHide();
	}
	
	$scope.hideComments = function(){
		if($scope.tasks[$scope.index].comments.length > 5){
			$('.media').hide();
			$('#more').show();
			$('#hide').hide();
			for(var i = $scope.tasks[$scope.index].comments.length-5; i < $scope.tasks[$scope.index].comments.length; i++){
				$('#' + i).show();
			}
		}else{
			$('#hide').hide();
			$('#more').hide();
		}
		$scope.showAndHide();
	}
	
	$scope.editCommentInfo = function(i){
		$scope.tasks[$scope.index].comments[i].editedComments.infoEdited = true;
		$('.media').hide();
		$('#well' + i).show();
		$('#hide').hide();
		$('#more').hide();
		$('#labelComments').html('Edited comments: ');
		$('#nbComments').html($scope.tasks[$scope.index].comments[i].editedComments.length);
		$('#addComment').hide();

		$('.timeline-centered').addClass('foo');
		$('.timeline-icon').hide();
	}
	
	$scope.back = function(i){
		$('.media').show('slow');
		$('#well' + i).hide();
		$('#labelComments').html('Comments: ');
		$('#nbComments').html($scope.tasks[$scope.index].comments.length);
		$('#addComment').show();
		
		if($scope.tasks[$scope.index].comments.length == 0 || $scope.tasks[$scope.index].comments.length==1){
			$('#hide').hide();
			$('#more').hide();
		}
		
		if($scope.tasks[$scope.index].comments.length >5){
			$('#hide').show();
		}
		
		$scope.showAndHide();
	}
	
	$scope.showAndHide = function(){
		if($scope.tasks[$scope.index].comments.length == 0 || $scope.tasks[$scope.index].comments.length==1){
			$('.timeline-centered').addClass('foo');
			$('.timeline-icon').hide();

		}else{
			$('.timeline-centered').removeClass('foo');
			$('.timeline-icon').show();
		}
	}
});