var app = angular.module('myApp', [ "ngRoute", "ngStorage" ]);

app.controller('MainCtrl', function($scope) {

	$scope.tasks = [];

});

app.controller('TasksCtrl', function($scope, $routeParams, $localStorage) {

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
			createdOn : new Date()
		});

		$scope.task = '';

		$localStorage.tasks = $scope.tasks;

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
	
	$scope.sortBy=function(filter){
		$scope.filter=filter;
	}
	
});

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
	angular.element(document).ready(function() {
		$('.well').hide();
	});
	$scope.tasks = $localStorage.tasks;

	$scope.index = $routeParams.ID;
	$scope.title = $scope.tasks[$scope.index].title;
	$scope.dueDate = $scope.tasks[$scope.index].dueDate;

	angular.element(document).ready(function() {
		$scope.hideComments();
	});
	
	if($scope.tasks[$scope.index].comments.length == 0){
		$('.timeline-icon').hide();
	}
	
	$('#saveComment').hide();

	$scope.update = function() {

		$scope.tasks[$scope.index].title = $scope.title;
		$scope.tasks[$scope.index].dueDate = $('#dueDate').val();
		if ($scope.comment != undefined && $scope.comment != '') {
			$scope.tasks[$scope.index].comments.push({
				comment : $scope.comment,
				date : new Date(),
				edited : false,
				editedComments:[]
			});
		}
		$scope.hideComments();
		
		$scope.comment = '';

		$scope.tasks[$scope.index].lastChangedOn = new Date();
		angular.element(document).ready(function() {
			$('.well').hide();
		});
		$('.timeline-icon').show();

	}

	$('#dueDate').daterangepicker({
		singleDatePicker : true,
		locale : {
			format : 'DD/MM/YYYY'
		}
	});
	
	$scope.editComment = function(index) {
		$('.timeline-icon').hide();

	    if( $( '#pseudo' ).length ) {
	        $( '#pseudo' ).remove();
	    } else {
	        var css = '<style id="pseudo">.timeline-centered::before{display: none !important;}</style>';
	        document.head.insertAdjacentHTML( 'beforeEnd', css );
	    };
		
		$('#form').hide();
		$('.media').hide();
		$('.action').hide();
		$('#' + index).show('slow');

		$scope.editComm = $scope.tasks[$scope.index].comments[index].comment;

		$('#addComment').hide();
		$('#saveComment').show();
		$('#more').hide();
		$('#hide').hide();
		
		$scope.updateEditedComment = function() {
			
			if($scope.editComm != $scope.tasks[$scope.index].comments[index].comment){
				$scope.tasks[$scope.index].comments[index].edited = true;
				$('.media').show('slow');
				$scope.tasks[$scope.index].comments[index].comment = $scope.editComm;
				$scope.tasks[$scope.index].comments[index].editedComments.push({title:$scope.editComm,editedDate:new Date(),infoEdited:false});
				
				$('.action').show();
				$('#addComment').show();
				$('#saveComment').hide();
				$scope.editComm = '';
				if($scope.tasks[$scope.index].comments.length > 5){
					$('#more').hide();
					$('#hide').show();
				}
			    if( $( '#pseudo' ).length ) {
			        $( '#pseudo' ).remove();
			    } else {
			        document.head.insertAdjacentHTML( 'beforeEnd', '');
			    };
				$('.timeline-icon').show();

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
		    if( $( '#pseudo' ).length ) {
		        $( '#pseudo' ).remove();
		    } else {
		        document.head.insertAdjacentHTML( 'beforeEnd', '');
		    };
			$('.timeline-icon').show();

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
		}
		if($scope.tasks[$scope.index].comments.length == 0){
			$('.timeline-icon').hide();
		}
	}
	
	$scope.moreComments = function(){
		$('.media').show('slow');
		$('#more').hide();
		$('#hide').show();
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
		$('.timeline-icon').hide();

	}
	
	$scope.back = function(i){
		$('.media').show('slow');
		$('#well' + i).hide();
		$('#labelComments').html('Comments: ');
		$('#nbComments').html($scope.tasks[$scope.index].comments.length);
		$('#addComment').show();
		$('#hide').show();
		$('.timeline-icon').show();

	}
		
});