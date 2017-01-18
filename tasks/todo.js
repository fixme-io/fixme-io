var app = angular.module('myApp', [ "ngRoute" ]);

app.controller('MainCtrl', function($scope) {

	$scope.tasks = [];

});

app.controller('TasksCtrl', function($scope, $routeParams) {
	$scope.tasksId = $routeParams.ID;

	$scope.add = function() {
		$scope.tasks.push({
			title : $scope.task,
			completed : false
		});
		$scope.task = '';

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
		console.log(index);
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

app.controller("EditCtrl", function($scope, $routeParams) {
	$scope.index = $routeParams.ID;
	$scope.title = $scope.tasks[$scope.index].title;

	$scope.update = function() {
		$scope.tasks[$scope.index].title = $scope.title;
	}
});

