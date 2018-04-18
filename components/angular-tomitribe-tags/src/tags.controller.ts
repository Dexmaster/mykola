import {TagReference} from "./tags.service";

export class TagsController {
    static $inject = ['$scope', 'TribeTagsService', 'TribeTagsConfigurer'];

    allLoaded: boolean = false;

    constructor(private $scope, private tagService, private tagConfigurer) {
        let _ = require('underscore');

        $scope.self = $scope; // this is weird right but then we reference with a dot and binding works cause angular doesn't copy it all
        $scope.availableTags = [];

        $scope.validationErrorMessage = tagConfigurer.validation.default.errorMessage();

        $scope.stringToTagReference = name => {
            const found = _.findWhere($scope.getFilteredAvailable(), {name: name});
            return found ? $scope.applyTaggingValidation(found) : this.createTag(name);
        };

        $scope.getFilteredAvailable = () => {
            // ignore selected to be able duplicate loaded tags
            const selected = $scope.ngModel || [];
            const fieldValid = $scope.form ? $scope.form[$scope.fieldName]['$valid'] : true; // on invalid ngModel undefined;
            const filtered = (!selected.length && !fieldValid) ? [] : _.filter($scope.availableTags, (tag) => {
              const isSelected = selected.reduce( (acc, item) => {
                return angular.equals(item, tag) || acc;
              }, false)
              return !selected.length ? true : !isSelected;
            })
            return filtered;
        }

        $scope.$on('tribe-tags:refresh', () => $scope.loadTagsProposals(true, ''));

        $scope.resetTagsProposals = () => {
            this.allLoaded = false;
            this.$scope.$$pagingState = undefined;
        }

        $scope.loadTagsProposals = (isOpen, query) => {
            if (!isOpen || $scope.$$pagingBusy) return;

            if (query !== $scope.$$pagingQuery) {
                $scope.$$pagingQuery = query;
                $scope.$$pagingState = undefined;
                this.allLoaded = false;
            }

            // we started our request (busy)
            $scope.$$pagingBusy = true;

            let params = {
                "pagingState": $scope.$$pagingState || undefined,
                "query": query || undefined,
                "size": 20
            };

            tagService.findTags(params)
                .then( (data) => {
                    // total without excluded (filtred)
                    const filtredTotal = data.total - ($scope.excludedNumber ? $scope.excludedNumber : 0);
                    // change collection if data changed
                    if (!this.allLoaded || $scope.$$total !== filtredTotal) {
                        let tagsFromServer = data.items.map(t => {
                            return new TagReference(t.id, t.name, {});
                        });

                        const previousArray = $scope.availableTags && $scope.$$pagingState ? $scope.availableTags : [];

                        // remove previous (new), union and sort
                        $scope.availableTags = tagConfigurer.sortFn(
                            _.union(previousArray, tagsFromServer)
                            .filter(tag => !!tag.id)
                        );

                        //Add tag if we didn't find it
                        const found = _.findWhere($scope.getFilteredAvailable(), {name: query});
                        if(query && !found) {
                            const newTag = this.createTag(query);
                            $scope.availableTags.unshift(newTag);
                        }

                        // check if we already loaded all
                        this.allLoaded = this.isAllLoaded($scope.availableTags, data.total);
                        // count total for footer
                        $scope.$$total = filtredTotal;
                        // pagination
                        $scope.$$pagingState = data.pagingState || undefined;
                    }
                })
                .finally( () => {
                    // finish request
                    $scope.$$pagingBusy = false;
                })
        }

        $scope.refreshDuplicateValidation = (selected) => {
            selected.forEach( tag => $scope.applyTaggingValidation(tag) )
        }
    }

    private createTag(name: string): TagReference {
        let tag:any = new TagReference(null, name, {});
        tag.isTag = true;
         // ui-select not allows duplicates, so we make tags unique
        this.makeTagUnique(tag);
        this.$scope.applyTaggingValidation(tag);

        return tag;
    }

    private makeTagUnique(tag: TagReference) {
        // as ui-select use angular.equals we have to add real field
        tag['uniqueField'] = Math.random() * Math.random();
        return tag;
    }

    private isAllLoaded(items: Array<any>, total: number): boolean {
      const loadedTags: number = items.reduce( (acc, item) => {
        return item['isTag'] ? acc : acc + 1;
      }, 0)

      return total === loadedTags;
    }
}
