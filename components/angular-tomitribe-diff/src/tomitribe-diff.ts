import 'core-js/es6';

/**
 * @ngdoc directive
 * @name angular-diff.directive:tribeDiff
 * @function
 *
 * @description
 * Inititates codemirror instance and connects it to attribute values
 *
 * @example
    div(data-tribe-diff, x-ng-show="showDiff", data-title-a="titleA", data-value-a="valueA", data-title-b="titleB", data-value-b="valueB", data-mode="application/json")
 */
module tomitribe_diff {
    export class tribeDiff implements ng.IDirective
    {
        public restrict = 'A';
        public templateUrl = 'tomitribe-diff.html';
        public scope = {
            valueA: '=',
            titleA: '=',
            valueB: '=',
            titleB: '=',
            mode: '@?'
        };

        public link:Function = (scope:ng.IScope, el:ng.IAugmentedJQuery, attrs:ng.IAttributes):void => {
            let checkLoaded = () => {
                if (!scope['valueA']) {
                    return;
                }
                if (!scope['valueB']) {
                    return;
                }
                $timeout(() => scope.$apply(() => scope['loaded'] = true));
            };
            let codemirror = require('codemirror/lib/codemirror.js');
            scope.$watch('valueA', checkLoaded);
            scope.$watch('valueB', checkLoaded);
            scope.$watch('loaded', () => {
                if (!scope['loaded']) {
                    return;
                }
                codemirror.MergeView(el.find('> div')[0], {
                    value: scope['valueA'],
                    orig: scope['valueB'],
                    mode: scope['mode'],
                    connect: 'align',
                    lineNumbers: true,
                    highlightDifferences: true,
                    collapseIdentical: false,
                    lineWrapping: true
                });
                if (scope['titleA'] && scope['titleB']) {
                    $timeout(() => {
                        let diffPanels = el.find('div.CodeMirror-merge-pane');
                        // left
                        angular.element(diffPanels[0]).prepend(`<h3 class="diff-title">${scope['titleA']}</h3>`);
                        // right
                        angular.element(diffPanels[1]).prepend(`<h3 class="diff-title">${scope['titleB']}</h3>`);
                        $timeout(() => {
                            let titleHeight = el.find('div.CodeMirror-merge-pane h3.diff-title').outerHeight();
                            let cmHeight = el.find('div.CodeMirror-merge-pane h3.diff-title ~ div.CodeMirror').outerHeight();
                            el.find('div.CodeMirror-merge-pane h3.diff-title ~ div.CodeMirror').outerHeight(cmHeight - titleHeight);
                        });
                    });
                }
            });
        };

        constructor() {
            this.scope['loaded'] = false;
            if (!this.scope['mode']) {
                this.scope['mode'] = 'application/json';
            }
        }
    }

    angular.module('angular-tomitribe-diff', [])
        .directive('tribeDiff',['$document', '$timeout', ($document, $timeout) =>  new tribeDiff()]);
}