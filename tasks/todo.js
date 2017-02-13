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
	
	$scope.tasks = $localStorage.tasks;

	$scope.index = $routeParams.ID;
	$scope.title = $scope.tasks[$scope.index].title;
	$scope.dueDate = $scope.tasks[$scope.index].dueDate;

	angular.element(document).ready(function() {
		$scope.hideComments();
	});
	
	$('#saveComment').hide();

	$scope.update = function() {

		$scope.tasks[$scope.index].title = $scope.title;
		$scope.tasks[$scope.index].dueDate = $('#dueDate').val();
		
		if ($scope.comment != undefined && $scope.comment != '') {
			$scope.tasks[$scope.index].comments.push({
				comment : $scope.comment,
				date : new Date(),
				edited : false
			});
		}
		
		$scope.hideComments();
		
		$scope.comment = '';

		$scope.tasks[$scope.index].lastChangedOn = new Date();

	}

	$('#dueDate').daterangepicker({
		singleDatePicker : true,
		locale : {
			format : 'DD/MM/YYYY'
		}
	});
	
	$scope.editComment = function(index) {
		
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
				
				$('.action').show();
				$('#addComment').show();
				$('#saveComment').hide();
				$scope.editComm = '';
				$('#more').hide();
				$('#hide').show();
			}
			
		}
		
		$scope.cancel= function(){
			$('.media').show('slow');
			$('.action').show();
			$('#addComment').show();
			$('#saveComment').hide();
			$scope.editComm = '';
			$('#more').hide();
			$('#hide').show();
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

});