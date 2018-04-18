import {TagReference} from "./tags.service";

export class TagsConfigurer {
    tagsEndpoint = 'api/label/available';
    sortFn = (items) => {
        return items.sort((a:any,b:any) => a['name'].localeCompare(b['name']))
    };

    /*
        TODO:
        If we add more validations, we might need to do something like this
        < ... tribe-tagging-validator ... > (meaning default)
        or < ... tribe-tagging-validator='numberPositive' ... > (meaning another future validation positive number)
     */

    validation = {
        default: {
            pattern: "^[A-Za-z0-9 ._-]*$",
            maxLength: 64,

            errorMessage(): string {
                return "Inputs must be alphanumeric, dot, space, scores and cannot exceed " + this.maxLength + " chars. Please remove invalid or duplicated entry(s).";
            },

            isValid(tagName: string, tags?: Array<any>, inputValdatorCheck:boolean = false): boolean {
                const regex = new RegExp(this.pattern);

                const lessThanMax = tagName.length <= this.maxLength;
                const passesRegex = regex.test(tagName);
                const notDuplicate = tags ? tags.filter((tag: TagReference) => tag.name === tagName).length <= (inputValdatorCheck ? 1 : 0): true;

                return tagName && lessThanMax && passesRegex && notDuplicate;
            },

            isDuplicate(tagName: string, tags: Array<any>): boolean {
                return tags ? !(tags.filter((tag: TagReference) => tag.name === tagName).length <= 1) : false;
            }
        }
    }
}
