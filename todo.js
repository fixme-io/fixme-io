var app = angular.module('myApp', ["ngRoute", "ngStorage", 'ng-sweet-alert', 'easypiechart']);
var selected;

app.controller('MainCtrl', function($scope) {

  $scope.tasks = [];
  $scope.selectedRow = 0;
  $scope.labels = [];

});

app.controller('chartCtrl', function($scope) {
  $scope.allTasks = $scope.remainingTasks() + $scope.tasks.length -
    $scope.remainingTasks();
  $scope.percent = 100 / $scope.allTasks;
  $scope.remainingTasksPercent = $scope.remainingTasks() * $scope.percent;
  $scope.completedTasksPercent = 100 - $scope.remainingTasksPercent;
  $scope.anotherOptions = {
    animate: {
      duration: 1000,
      enabled: true
    },
    barColor: '#63A58B',
    scaleColor: false,
    lineWidth: 55,
    trackColor: '#E26C75',
    lineCap: 'circle'
  };
});

app.directive('focus', function($timeout) {
  return {
    scope: {
      trigger: '@focus'
    },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if (value === "true") {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});

app.directive('trash', function() {
  return {
    templateUrl: "trash.html",
    link: function(scope, element, attrs) {
      scope.iconClass = attrs['class'] || 'defaultIcon';
      scope.action = attrs.action || '';
    }
  }
});

app.controller('TasksCtrl', function($scope, $routeParams, $localStorage,
  $document) {

  angular.element(document).ready(function() {
    jQuery(".timeago").timeago();
  });

  $scope.tasksId = $routeParams.ID;
  $scope.tasks = $localStorage.tasks ? $localStorage.tasks : [];

  // $localStorage.$reset();

  $scope.add = function() {

    $scope.tasks.push({
      title: $scope.task,
      completed: false,
      dueDate: null,
      comments: [],
      priority: "Medium",
      createdOn: moment().format(),
      assignee: "Me",
      reporter: "Me",
      selectedRow: $scope.selectedRow
    });

    $scope.task = '';

    $localStorage.tasks = $scope.tasks;

    angular.element(document).ready(function() {
      jQuery(".timeago").timeago();
    });

  }

  $scope.exportTasks = function() {
    return JSON.stringify($scope.tasks);
  }

  $scope.importTasks = function(){
    $scope.importedTasks = JSON.parse($scope.import);

    for(var i = 0; i < $scope.importedTasks.length; i++){
      $scope.tasks.push($scope.importedTasks[i]);
    }

    window.location.href = '#';
  }

  if (selected != null) {
    $scope.selectedRow = $scope.tasks[selected].selectedRow;
  }

  $scope.getPriorityOrder = function(task) {
    if (task.priority == 'High') {
      return -1;
    } else if (task.priority == 'Low') {
      return 1;
    }else{
      return 0;
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

  $scope.sweet = {};
  $scope.sweet.option = {
    title: "Are you sure?",
    text: "You will not be able to recover this task!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    closeOnConfirm: false,
    closeOnCancel: true
  }
  $scope.sweet.confirm = {
    title: 'Deleted!',
    showConfirmButton: false,
    timer: 1000,
    type: 'success',
  };

  $scope.remove = function(index) {
    $scope.tasks.splice(index, 1);
  }

  $('#tasks').css('cursor', 'pointer');

  var prevId;

  $scope.sortBy = function(filter, id) {

    if (prevId != null) {
      $('tr th:nth-child(' + prevId + ')').css('color', 'black');
    }

    $scope.filter = filter;

    prevId = id;
    $('tr th:nth-child(' + id + ')').css('color', 'gray');
  }

  $scope.escape = function() {
    $scope.userSearch = '';
  }

  $scope.setClickedRow = function(index) {
    $scope.selectedRow = $scope.tasks[index].selectedRow;
    $scope.tasks[index].selectedRow = index;
    selected = index;
  }

  $scope.completedTasks = function(index) {
    if ($scope.tasks[index].completed) {
      $scope.tasks[index].resolvedOn = moment().format();
    } else {
      $scope.tasks[index].resolvedOn = '';
    }
  }

  $scope.findTasks = function() {
    var completed = [];
    var remaining = [];

    for (var i = 0; i < $scope.tasks.length; i++) {
      if ($scope.tasks[i].completed) {
        completed.push($scope.tasks[i]);
      } else {
        remaining.push($scope.tasks[i]);
      }
    }

    if ($scope.tasksId == undefined) {
      return $scope.tasks;
    } else if ($scope.tasksId == 'completed') {
      return completed;
    } else {
      return remaining;
    }
  }

});

app.directive('arrowSelector', ['$document', function($document) {
  return {
    restrict: 'A',
    link: function($scope, elem, attrs, ctrl) {
      var elemFocus = false;
      elem.on('mouseenter', function() {
        elemFocus = true;
        $(this).css('cursor', 'pointer')
      });
      $document.bind('keydown', function(e) {
        if (elemFocus) {
          if (e.keyCode == 38) {
            if ($scope.selectedRow == 0) {
              return;
            }
            $scope.selectedRow--;
            $scope.$apply();
            e.preventDefault();
          }
          if (e.keyCode == 40) {
            if ($scope.selectedRow == $scope.tasks.length - 1) {
              return;
            }
            $scope.selectedRow++;
            $scope.$apply();
            e.preventDefault();
          }
          if (e.keyCode == 13) {
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
    templateUrl: "tasks.html",
    controller: "TasksCtrl"
  }).when("/edit/:ID", {
    templateUrl: "edit.html",
    controller: "EditCtrl"
  }).when("/info", {
    templateUrl: "info.html",
    controller: "TasksCtrl"
  }).when("/export", {
    templateUrl: "export.html",
    controller: "TasksCtrl"
  }).when("/import", {
    templateUrl: "import.html",
    controller: "TasksCtrl"
  }).when("/labels", {
    templateUrl: "labels.html",
    controller: "LabelCtrl"
  }).when("/:ID", {
    templateUrl: "tasks.html",
    controller: "TasksCtrl"
  });
});

app.controller("LabelCtrl", function($scope, $localStorage) {

  $scope.labels = $localStorage.labels ? $localStorage.labels : [];

  $scope.add = function(){

    $scope.labels.push($scope.label);
    $scope.label = '';
    $localStorage.labels = $scope.labels;

  }

  $scope.remove = function(index) {
    $scope.labels.splice(index, 1);
  }

  $scope.edit = function(i){
    swal({
      title: "",
      type: "input",
      showCancelButton: true,
      closeOnConfirm: false,
      inputPlaceholder: $scope.labels[i]
    },
    function(inputValue){
      if (inputValue === false){
        return false;
      } else if (inputValue === "") {
        swal.showInputError("You need to write something!");
        return false
      }else{
        $scope.labels[i] = inputValue;
        $scope.$apply();
        swal.close();
      }
  });
}

  $scope.sweet = {};
  $scope.sweet.option = {
    title: "Are you sure?",
    text: "You will not be able to recover this label!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    closeOnConfirm: false,
    closeOnCancel: true
  }
  $scope.sweet.confirm = {
    title: 'Deleted!',
    showConfirmButton: false,
    timer: 1000,
    type: 'success',
  };


});

app.controller("EditCtrl", function($scope, $routeParams, $localStorage) {

  $scope.tasks = $localStorage.tasks;
  $scope.index = $routeParams.ID;
  $scope.title = $scope.tasks[$scope.index].title;
  $scope.details = $scope.tasks[$scope.index].details;
  $scope.dueDate = $scope.tasks[$scope.index].dueDate;

  if ($scope.tasks[$scope.index].comments.length > 5) {
    $scope.moreComments = true;
  }

  if ($scope.tasks[$scope.index].comments.length == 0 ||
    $scope.tasks[$scope.index].comments.length == 1) {

    $scope.timeline = 'timeline-centered timeline';
    $scope.timelineIcon = false;

  } else {

    $scope.timeline = 'timeline-centered';
    $scope.timelineIcon = true;

  }

  $scope.addComment = true;
  $scope.commentsBtn = true;
  $scope.labelComments = 'Comments: ';
  $scope.nbComments = $scope.tasks[$scope.index].comments.length;
  $scope.currentlyEditing = false;

  angular.element(document).ready(function() {
    jQuery(".timeago").timeago();
    $scope.hideComments();
    $scope.showAndHide();
    $scope.saveComment = false;
  });

  if ($scope.tasks[$scope.index].completed) {
    $scope.tasks[$scope.index].status = 'Closed';
  } else {
    $scope.tasks[$scope.index].status = 'In progress';
  }

  $('#assignee').on('click', function() {
    var $this = $(this);
    var $input = $('<input>', {
      value: $this.text(),
      type: 'text',
      blur: function() {
        $this.text(this.value);
      },
      keyup: function(e) {
        if (e.which === 13)
          $input.blur();
        $scope.tasks[$scope.index].assignee = this.value;
      }
    }).appendTo($this.empty()).focus();
  });

  $('#reporter').on('click', function() {
    var $this = $(this);
    var $input = $('<input>', {
      value: $this.text(),
      type: 'text',
      blur: function() {
        $this.text(this.value);
      },
      keyup: function(e) {
        if (e.which === 13)
          $input.blur();
        $scope.tasks[$scope.index].reporter = this.value;
      }
    }).appendTo($this.empty()).focus();
  });

  $scope.update = function() {

    $scope.tasks[$scope.index].title = $scope.title;
    $scope.tasks[$scope.index].dueDate = $('#dueDate').val();
    $scope.tasks[$scope.index].details = $scope.details;

    if ($scope.comment != undefined && $scope.comment != '') {
      $scope.taskComments().push({
        comment: $scope.comment,
        date: moment().format(),
        edited: false,
        editedComments: []
      });
    }

    $scope.showAndHide();
    $scope.hideComments();
    $scope.comment = '';

    $scope.tasks[$scope.index].lastChangedOn = moment().format();

    angular.element(document).ready(function() {
      jQuery(".timeago").timeago();
    });

    $scope.nbComments = $scope.taskComments().length;

  }

  $('#dueDate').daterangepicker({
    singleDatePicker: true,
    locale: {
      format: 'DD/MM/YYYY'
    }
  });

  $scope.editComment = function(index) {

    $scope.timeline = 'timeline-centered timeline';
    $scope.timelineIcon = false;
    $scope.commentsBtn = false;
    $scope.editComm = $scope.taskComments()[index].comment;
    $scope.addComment = false;
    $scope.saveComment = true;
    $scope.moreComments = false;
    $scope.lessComments = false;
    $scope.labelComments = '';
    $scope.nbComments = '';
    $scope.currentlyEditing = true;

    $('.media').hide();
    $('#' + index).show('slow');

    $scope.updateEditedComment = function() {
      var comments = $scope.taskComments();
      if ($scope.editComm != comments[index].comment) {
        comments[index].edited = true;
        comments[index].comment = $scope.editComm;
        comments[index].editedComments.push({
          title: $scope.editComm,
          editedDate: moment().format(),
          infoEdited: false
        });

        $scope.showAndHide();

        $scope.commentsBtn = true;
        $scope.addComment = true;
        $scope.saveComment = false;
        $scope.editComm = '';
        $scope.currentlyEditing = false;

        $('.media').show('slow');

        if (comments.length > 5) {
          $scope.moreComments = false;
          $scope.lessComments = true;
        }

        angular.element(document).ready(function() {
          jQuery(".timeago").timeago();
        });

        $scope.labelComments = 'Comments: ';
        $scope.nbComments = comments.length;
      }
    }

    $scope.cancel = function() {
      $('.media').show('slow');

      $scope.commentsBtn = true;
      $scope.addComment = true;
      $scope.saveComment = false;
      $scope.editComm = '';
      $scope.currentlyEditing = false;

      if ($scope.taskComments().length > 5) {
        $scope.moreComments = false;
        $scope.lessComments = true;
      }

      $scope.showAndHide();

      $scope.labelComments = 'Comments: ';
      $scope.nbComments = $scope.taskComments().length;
    }
  }

  $scope.sweet = {};
  $scope.sweet.option = {
    title: "Are you sure?",
    text: "You will not be able to recover this comment!",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    closeOnConfirm: false,
    closeOnCancel: true
  }

  $scope.sweet.confirm = {
    title: 'Deleted!',
    showConfirmButton: false,
    timer: 1000,
    type: 'success',
  };

  $scope.remove = function(index) {
    $scope.taskComments().splice(index, 1);

    for (var i = $scope.taskComments().length - 5; i < $scope
      .taskComments().length; i++) {
      $('#' + i).show();
    }

    if ($scope.taskComments().length <= 5) {
      $scope.lessComments = false;
      $scope.moreComments = false;
    }

    $scope.showAndHide();

    $scope.labelComments = 'Comments: ';
    $scope.nbComments = $scope.taskComments().length;
  }

  $scope.showComments = function() {
    $('.media').show('slow');

    $scope.moreComments = false;
    $scope.lessComments = true;

    $scope.showAndHide();
  }

  $scope.hideComments = function() {
    if ($scope.taskComments().length > 5) {
      $('.media').hide();

      $scope.moreComments = true;
      $scope.lessComments = false;

      for (var i = $scope.taskComments().length - 5; i < $scope
        .taskComments().length; i++) {
        $('#' + i).show();
      }
    } else {
      $scope.lessComments = false;
      $scope.moreComments = false;
    }

    $scope.showAndHide();
  }

  $scope.editCommentInfo = function(i) {
    $('.media').hide();

    $scope.taskComments()[i].editedComments.infoEdited = true;
    $scope.lessComments = false;
    $scope.moreComments = false;
    $scope.labelComments = 'Edited comments: ';
    $scope.nbComments = $scope.taskComments()[i].editedComments.length;
    $scope.addComment = false;
    $scope.timeline = 'timeline-centered timeline';
    $scope.timelineIcon = false;
  }

  $scope.back = function(i) {
    $('.media').show('slow');

    $scope.taskComments()[i].editedComments.infoEdited = false;
    $scope.labelComments = 'Comments: ';
    $scope.nbComments = $scope.taskComments().length;
    $scope.addComment = true;

    if ($scope.taskComments().length == 0 ||
      $scope.taskComments().length == 1) {
      $scope.lessComments = false;
      $scope.moreComments = false;
    }

    if ($scope.taskComments().length > 5) {
      $scope.lessComments = true;
    }

    $scope.showAndHide();
  }

  $scope.showAndHide = function() {
    if ($scope.taskComments().length == 0 ||
      $scope.taskComments().length == 1) {

      $scope.timeline = 'timeline-centered timeline';
      $scope.timelineIcon = false;

    } else {

      $scope.timeline = 'timeline-centered';
      $scope.timelineIcon = true;

    }
  }

  $scope.taskComments = function() {
    return $scope.tasks[$scope.index].comments;
  }

});
