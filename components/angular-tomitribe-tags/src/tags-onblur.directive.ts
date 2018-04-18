/**
 * @ngdoc directive
 * @name tomitribe-tags.directive:tribeTagsOnBlur
 * @function
 *
 * @description
 * Directive allowing to create a tag on blur event (like JIRA).
 *
 */
export class TagsOnBlurDirective {
  constructor(private $timeout) {
  }

  require = 'uiSelect';
  link = (scope, element, attributes, controller) => {
    if(attributes.tribeTagsOnBlur !== '' && !(attributes.tribeTagsOnBlur === "true")) {
      return;
    }
    controller.searchInput.on('blur', () => {
      this.$timeout(() => {
        if (controller.search == '') {
          return;
        }

        //Item is already created.
        var item = controller.items[controller.activeIndex];
        if(item) {
          //Its there, so select it
          controller.select(item, true);
        }
      });
    });
  };
}
