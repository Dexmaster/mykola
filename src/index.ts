import './vendors';
import * as angular from 'angular';

import "./styles/app.sass";

import { LongDuration, TimeUtils } from "../components/ts-tomitribe-util/index";

let _ = require('underscore');

module index {
    angular.module("demo-app", [
            'ngRoute',
            'tomitribe-button',
            'tomitribe-fab',
            'tomitribe-tooltip',
            'tomitribe-dropdown',
            'tomitribe-bulkedit',
            'tomitribe-tags',
            'tomitribe-sortable',
            'tomitribe-select',
            'infinite-scroll'
        ])
        .filter('prettify', function () {

            function syntaxHighlight(json) {
                json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                    var cls = 'number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            }

            return syntaxHighlight;
        })
        .config(['uiSelectConfig', function (uiSelectConfig) {
            uiSelectConfig.theme = 'selectize';
            uiSelectConfig.resetSearchInput = true;
        }])
        .config([
            '$locationProvider', '$routeProvider', '$httpProvider', '$logProvider',
            function ($locationProvider, $routeProvider, $httpProvider, $logProvider) {
                $logProvider.debugEnabled(false); // GUI is really too slow, let's use a debugger if needed

                $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: true
                });

                $routeProvider
                    .when('/', {
                        template: require('./templates/home.jade'),
                        controller: ['$scope', ($scope) => {

                        }]
                    })
                    .when('/plus', {
                        template: require('./templates/plus.jade'),
                        controller: ['$scope', ($scope) => {
                            $scope.menuOneStatus = true;
                            const onAction = a => $scope.selectedAction = a;
                            $scope.actions = ['pencil', 'remove'].map(n => {
                                return {icon: n, name: n, invoke: () => onAction(n)};
                            });
                        }]
                    })
                    .when('/bulk-edit', {
                        template: require('./templates/bulk-edit.jade'),
                        controller: ['$scope', ($scope) => {
                            const onAction = (items, action) => {
                                $scope.selectedAction = action;
                                $scope.selectedItems = items.constructor == Array ? items : [items];
                            };
                            $scope.itemsObject = {
                                'arr1': [
                                    {
                                        name: 'arr1 1 App',
                                        rate: 6
                                    },
                                    {
                                        name: 'arr1 2 App',
                                        rate: 3
                                    },
                                    {
                                        name: 'arr1 3 App',
                                        rate: 1
                                    }
                                ],
                                'arr2': [
                                    [
                                        {
                                            name: 'arr2 1 App',
                                            rate: 22
                                        }
                                    ]
                                ],
                                'arr3': {
                                    'items': [
                                        {
                                            name: 'arr3 1 App',
                                            rate: 7
                                        },
                                        {
                                            name: 'arr3 2 App',
                                            rate: 15
                                        }
                                    ]
                                }
                            };
                            $scope.itemsProp = [
                                {path: 'arr1', type: 'array 1 $$type'},
                                {path: ['arr2',0]},
                                {path: 'arr3.items'}
                            ];

                            $scope.items = [{
                                name: 'First App',
                                rate: 5
                            },
                                {
                                    name: 'Another App',
                                    rate: 3
                                },
                                {
                                    name: 'Second App',
                                    rate: 4
                                },
                                {
                                    name: 'Last App',
                                    rate: 5
                                }];
                            //$scope.items[0].$$selected = true;

                            $scope.items2 = [
                                {
                                    name: 'First App',
                                    rate: 5
                                },
                                {
                                    name: 'Second App',
                                    rate: 5
                                },
                                {
                                    name: 'Third App',
                                    rate: 5
                                }];

                            $scope.items3 = [
                                {
                                    name: 'First App',
                                    rate: 5
                                },
                                {
                                    name: 'Second App',
                                    rate: 5
                                },
                                {
                                    name: 'Third App',
                                    rate: 5
                                }];

                            $scope.options3 = {
                                totalCount: 40
                            };


                            $scope.operatorItems = [
                                {
                                    iconClass: "fa-2x fa-share",
                                    itemClass: "class1",
                                    invoke: function (items) {
                                        onAction(items, 'share');
                                    },
                                    applyAll: true,
                                    tooltip: "share"
                                },
                                {
                                    iconClass: "fa-2x fa-inbox",
                                    itemClass: "class2",
                                    invoke: function (items) {
                                        onAction(items, 'archive');
                                    },
                                    applyAll: true,
                                    tooltip: "archive"
                                },
                                {
                                    iconClass: "fa-2x fa-trash",
                                    invoke: function (items) {
                                        onAction(items, 'delete');
                                    },
                                    applyAll: true,
                                    tooltip: "delete"
                                },
                            ];

                            $scope.checkedStatus = false;

                            $scope.getDescendantProp = (obj, path) => {
                                if(!Array.isArray(path))
                                    path = (typeof path === 'string' && (path.indexOf('.') > -1))? path.split('.') : [path];
                                return path.reduce((acc, part) => acc && acc[part], obj);
                            };
                        }]
                    })
                    .when('/dropdown', {
                        template: require('./templates/dropdown.jade'),
                        controller: ['$scope', ($scope) => {
                            $scope.dropDownStatus = true;
                            $scope.dropDownTwoStatus = true;
                            $scope.doSomething = () => {
                                window.alert("on click");
                            }
                        }]
                    })
                    .when('/tags', {
                        template: require('./templates/tags.jade'),
                        controller: ['$scope', ($scope) => {
                            $scope.tags = [];

                            $scope.loadMore = ()=> {
                                console.log("load more");
                            }
                        }]
                    })
                    .when('/tooltip', {
                        template: require('./templates/tooltip.jade'),
                        controller: ['$scope', '$timeout', ($scope, $timeout) => {
                            $scope.message = "First Content";
                            $timeout(function () {
                                $scope.message = "Has you may notice, the content is now different";
                            }, 3000)
                        }]
                    })
                    .when('/sortable', {
                        template: require('./templates/sortable.jade'),
                        controller: ['$scope', ($scope) => {
                            $scope.data1 = [
                                {id: 1, name: 'A'},
                                {id: 2, name: 'B'},
                                {id: 3, name: 'C'},
                                {id: 4, name: 'D'}
                            ];

                            $scope.data2 = [
                                {id: 5, name: 'E'},
                                {id: 6, name: 'F'},
                                {id: 7, name: 'J'},
                                {id: 8, name: 'H'}
                            ];

                            $scope.add = function () {
                                $scope.data1.push({id: $scope.data1.length + 1, name: 'E'});
                            };

                            $scope.sortableCallback = function (from, to, model, fn) {
                                console.log('Can call standard function or our own (' + from + ' -> ' + to + ')');
                                return fn(from, to, model);
                            };
                        }]
                    })
                    .when('/select', {
                        template: require('./templates/select.jade'),
                        controller: ['$scope', '$timeout', ($scope, $timeout) => {
                            var increment = 10;
                            $scope.ages = [1, 2, 5, 10, 25, 35, 100];
                            $scope.myAge11 = 2;
                            $scope.agesPaginated = [];
                            $scope.sampleObjects = [
                                {
                                    name: "object 1",
                                    value: "1"
                                },
                                {
                                    name: "object 2",
                                    value: "2"
                                },
                                {
                                    name: "object 3",
                                    value: "3"
                                },
                                {
                                    name: "object 4",
                                    value: "4"
                                }
                            ];

                            $scope.allowTabCondition = true;

                            $scope.executeSelectFetchOnOpen = () => {
                                console.log("Executing executeSelectFetchOnOpen");
                            }

                            // Issue with ui-select multiple
                            // [ui.select:choices] Expected multiple .ui-select-choices-row but got '0'
                            // Issue https://github.com/angular-ui/ui-select/issues/1355
                            $scope.tagNull = t => null;

                            function generateAges() {
                                let ages =  _.range(increment - 10, increment);
                                increment += 10;
                                return ages;
                            }

                            $scope.loadAgesDummy = () => {
                                console.log("calling loadAgesDummy");
                            };

                            $scope.loadAges = () => {
                                $scope.$$pagingBusy = true;

                                $timeout(()=> {
                                    $scope.agesPaginated = $scope.agesPaginated.concat(generateAges());
                                    $scope.$$total = 40;
                                    $scope.$$pagingState = $scope.agesPaginated.length < 40;
                                    $scope.$$pagingBusy = false;
                                }, 400);
                            };

                            $scope.taggingCallback = (v) => {
                            }
                        }]
                    })
                    .when('/utils', {
                        template: require('./templates/utils.jade'),
                        controller: ['$scope', ($scope) => {
                            $scope.aString = "30 hours, 10 minutes and 60 seconds";
                            $scope.aObject = new LongDuration($scope.aString);

                            $scope.bString = "23m, 26 seconds and 1000ms";
                            $scope.bObject = new LongDuration($scope.bString);

                            $scope.fObject = {
                                a: $scope.aObject.formatHighest(),
                                b: $scope.bObject.formatHighest()
                            };

                            $scope.nObject = new LongDuration.Normalize(new LongDuration($scope.fObject.a), new LongDuration($scope.fObject.b));

                            $scope.abObject = {
                                a: TimeUtils.abbreviate($scope.fObject.a),
                                b: TimeUtils.abbreviate($scope.fObject.b)
                            };

                            $scope.$watch('aString', (n, o) => {
                                if (n && n !== o) {
                                    $scope.aObject.parseLongDuration($scope.aString);
                                    $scope.fObject.a = $scope.aObject.formatHighest();
                                    $scope.abObject.a = TimeUtils.abbreviate($scope.fObject.a);
                                    $scope.nObject = new LongDuration.Normalize(new LongDuration($scope.fObject.a), new LongDuration($scope.fObject.b));
                                }
                            });

                            $scope.$watch('bString', (n, o) => {
                                if (n && n !== o) {
                                    $scope.bObject.parseLongDuration($scope.bString);
                                    $scope.fObject.b = $scope.bObject.formatHighest();
                                    $scope.abObject.b = TimeUtils.abbreviate($scope.fObject.b);
                                    $scope.nObject = new LongDuration.Normalize(new LongDuration($scope.fObject.a), new LongDuration($scope.fObject.b));
                                }
                            });
                        }]
                    })
                    .otherwise({
                        controller: ['$scope', '$location', ($scope, $location) => {
                            $scope.path = $location.path();
                        }],
                        template: require('./templates/home.jade')
                    });
            }
        ])
        .run(['$rootScope', function ($rootScope) {
            $rootScope.baseFullPath = angular.element('head base').first().attr('href');
        }]);
}
