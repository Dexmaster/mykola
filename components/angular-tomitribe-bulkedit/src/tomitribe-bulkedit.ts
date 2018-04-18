/**
 * @ngdoc directive
 * @name tomitribe-bulkedit.directive:tribeBulkedit
 *
 * @restrict 'E'
 *
 * @param {(Object[]|Object)}   listItems                       List of all items (could be array(list) of objects(items) or object with different lists in properties)
 *
 * @param {Object[]}            [listProp]                   List of properties if listItems is an object
 * @property {(string|Array)=}  listProp[].path                 Dot separated descendant path 'a.0.b' or an array descendant path ['a', 0, 'b']
 * @param {string=}            [listProp[].type]                Type to be written into a multiField
 *
 * @param {Object[]}            operatorItems                   Operation used for each selected item
 * @property {string=}          operatorItems[].itemClass       Operation item classes
 * @property {string=}          operatorItems[].iconClass       Operation icon classes
 * @property {string=}          operatorItems[].tooltip         Operation item tooltip
 * @property {function}         operatorItems[].invoke          Operation function which will be invoked
 * @property {boolean=}         operatorItems[].applyAll        Operation function apply all items at once
 *
 * @param {string=}             [selectField='$$selected']      Field that is used as select property
 * @param {string=}             [multiField='$$type']           Field that is used as additional multiField property
 * @param {string=}             [itemsName='Items']             Field that is used in counter in bulk bar
 *
 * @param {Object=}             [options]                       Other options
 * @param {boolean=}            [options.allChecked=false]      All checked two way flag
 * @param {boolean=}            [options.noneChecked]           None checked two way flag
 * @param {number=}             [options.selectedCount]         Counter for selected items
 *
 * @description
 * Create bulk edit bar, used for applying operator actions on selected items
 *
 * @scope
 *
 * @example
 * <example module="tribeBulkeditEx">
 <file name="index.html">
     <div ng-controller="TribeBulkeditCtrl">
         <ul class="items-list">
             <li class="item" ng-repeat="item in listItems" ng-click="item.$$selected = !item.$$selected" ng-class="{selected: item.$$selected}">
             {{item.name}}, {{item.rate}}, {{item.$$selected | json}}
             </li>
         </ul>
        <tribe-bulkedit list-items="listItems" operator-items="operatorItems" select-field="$$selected" options="bulkOptions">
        </tribe-bulkedit>
     </div>
 </file>
 <file name="script.js">
 angular.module('tribeBulkeditEx', ['tomitribe-bulkedit', 'tomitribe-tooltip'])
    .controller('TribeBulkeditCtrl', ['$scope', function($scope){
        $scope.listItems = [{
                name: 'FirstApp',
                rate: 5
            },
            {
                name: 'SecondApp',
                rate: 3
            },
            {
                name: 'SecondApp',
                rate: 4
            },
            {
                name: 'SecondApp',
                rate: 5
            }];
        $scope.listItems[0].$$selected = true;
        $scope.operatorItems = [
            {
                iconClass: "fa-share",
                itemClass: "class1",
                invoke: function(items){console.log(items)},
                tooltip: "share"
            },
            {
                iconClass:"fa-inbox",
                itemClass:"class2",
                invoke: function(items){console.log(items)},
                tooltip: "archive"
            },
            {
                iconClass:"fa-trash",
                invoke: function(items){console.log(items)},
                applyAll: true,
                tooltip: "delete"
            },
        ];
        $scope.bulkOptions = {allChecked: false, noneChecked: false, selectedCount: 1};
      }]);
 </file>
 </example>
 */
module tomitribe_bulkbar {
    require('./tomitribe-bulkedit.sass');

    angular
        .module('tomitribe-bulkedit', [])
        .directive('tribeBulkedit', tribebulkbar)
        .directive('tribeClick', tribeclick);

    function tribebulkbar() {
        let _ = require('underscore');
        return {
            restrict: 'E',
            template: require('./tomitribe-bulkedit.jade'),
            controller: ['$scope', '$document', bulkEditController],
            scope: {
                operatorItems: '=',
                listItems: '=',
                listProp: '=?',
                selectField: '@?',
                multiField: '@?',
                itemsName: '@?',
                options: '=?'
            },
            link: link
        };
        function link(scope) {
            scope.selectState = false;
            scope.showAllChecker = true;
            scope.itemsCount = 0;
            scope.allChecked = false;
            if (scope.options && !angular.isObject(scope.options)) {
                scope.options = {};
            }
            if (!scope.listItems) scope.listItems = [];
            if (!scope.listProp) scope.listProp = [];
            if (!scope.selectField) scope.selectField = "$$selected";
            if (!scope.multiField) scope.multiField = "$$type";
            if (!scope.itemsName) scope.itemsName = "Items";
        }

        function getDescendantProp(obj, path) {
            if(!Array.isArray(path))
                path = (typeof path === 'string' && (path.indexOf('.') > -1))? path.split('.') : [path];
            return path.reduce((acc, part) => acc && acc[part], obj);
        }

        function bulkEditController($scope, $document) {
            $scope.$watchCollection(
                function () {
                    let selectedItems = [], itemsCount = 0;
                    if (!!$scope.listItems) {
                        if ($scope.listItems.length > 0 || (angular.isArray($scope.listProp) && !angular.isArray($scope.listItems))) {
                            if ($scope.listProp.length) {
                                itemsCount = 0;
                                angular.forEach($scope.listProp, function (prop) {
                                    let arr = getDescendantProp($scope.listItems, prop.path);
                                    if (arr && angular.isArray(arr)) {
                                        arr.map(function (item) {
                                            if ($scope.multiField && prop.type) item[$scope.multiField] = prop.type;
                                            if (item[$scope.selectField]) selectedItems.push(item);
                                        });
                                        itemsCount += arr.length;
                                    }
                                });
                            } else {
                                angular.forEach($scope.listItems, function (item) {
                                    if (item[$scope.selectField]) selectedItems.push(item);
                                });
                                itemsCount = $scope.listItems.length;
                            }
                        }
                    }
                    if ($scope.itemsCount !== itemsCount) $scope.itemsCount = itemsCount;
                    return selectedItems;
                }, function (selectedItems) {
                    $scope.selectedCount = selectedItems.length;
                    $scope.selectedItems = selectedItems;
                    $scope.updateChecks();
                    if ((typeof $scope.options === 'object')
                        && $scope.options.hasOwnProperty('selectedCount')) {
                        $scope.options.selectedCount = $scope.selectedCount;
                    }
                }, true);

            $scope.updateChecks = _.debounce(function () {
                if ($scope.itemsCount > 0) {
                    $scope.allChecked = ($scope.selectedItems.length === $scope.itemsCount);
                    $scope.noneChecked = ($scope.selectedItems.length === 0);
                    if (typeof $scope.options === 'object') {
                        if ($scope.options.hasOwnProperty('allChecked')
                            && $scope.options.allChecked !== $scope.allChecked) {
                            $scope.options.allChecked = $scope.allChecked;
                        }
                        if ($scope.options.hasOwnProperty('noneChecked')
                            && $scope.options.noneChecked !== $scope.noneChecked) {
                            $scope.options.noneChecked = $scope.noneChecked;
                        }
                    }
                }
            }, 100, true);

            $scope.$watch('itemsCount', (nv, pv) => {
                if (nv !== pv) $scope.updateChecks();
            });

            $scope.checkAll = function (state) {
                if (typeof state === "boolean") {
                    $scope.selectState = state;
                } else {
                    $scope.selectState = !$scope.selectState;
                }
                if ($scope.listProp.length) {
                    angular.forEach($scope.listProp, function (prop) {
                        let arr = getDescendantProp($scope.listItems, prop.path);
                        if (arr && angular.isArray(arr)) {
                            angular.forEach(arr, function (item) {
                                item[$scope.selectField] = state;
                            });
                        }
                    });
                } else {
                    angular.forEach($scope.listItems, function (item) {
                        item[$scope.selectField] = state;
                    });
                }
            };

            $scope.applyBulk = function (operator) {
                if (!operator) return;
                var items = $scope.selectedItems,
                    applyAll = operator.applyAll || false;
                if (!!items && items.length > 0) {
                    if (applyAll) {
                        operator.invoke(items);
                    } else {
                        angular.forEach($scope.selectedItems, function (item) {
                            operator.invoke(item);
                        });
                    }
                }
            };

            $document.on('keyup', function (e) {
                if (e.keyCode === 27) {
                    $scope.checkAll(false);
                    $scope.$apply();
                }
            });
        }
    }

    function tribeclick() {
        return {
            restrict: 'A',
            scope: {
                item: '=tribeClick',
                selectField: '@?',
                disabled: '=?tribeClickDisabled'
            },
            link: link
        };
        function link(scope, element) {
            if (!scope.selectField) scope.selectField = "$$selected";
            scope.disabled = scope.disabled !== undefined ? scope.disabled : false;

            if (scope.item) {
                element.bind('click', (e)=> {
                    if (e.ctrlKey && !scope.disabled) {
                        scope.item[scope.selectField] = !scope.item[scope.selectField];
                        scope.$apply();
                    }
                });
            }
        }
    }
}