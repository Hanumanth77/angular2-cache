import {
    isBlank,
    isArray,
    isDate
} from '@angular/common/src/facade/lang';

export function generateUUID() {
    let currentDate:number = Date.now();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const result:number = (currentDate + Math.random() * 16) % 16 | 0;
        currentDate = Math.floor(currentDate / 16);
        return (c == 'x' ? result : (result & 0x3 | 0x8)).toString(16);
    });
}

export class CacheKeyBuilder {

    static ORIFINAL_STR_FN = Object.prototype.toString;


    private parts:Array<any> = [];

    constructor(parts?:Array<any>) {
        this.append(parts);
    }

    public static make(...args:Array<any>):CacheKeyBuilder {
        return new CacheKeyBuilder(args);
    }

    /**
     * We must prevent recursion using this method if an object has an overridden method
     */
    public appendObjectName(userObject:any):CacheKeyBuilder {
        this.parts.push(userObject.constructor.name);
        return this;
    }

    public append(...parts:any[]):CacheKeyBuilder {
        parts.forEach((part:any) => {
            if (isBlank(part)) {
                this.parts.push(part === null ? "null" : "undefined");
            } else {
                if (isArray(part)) {
                    (part as Array<any>).forEach((partItem:any) => this.append(partItem));
                } else if (isDate(part)) {
                    this.parts.push((part as Date).getTime());
                } else {
                    if (part.toString && part.toString !== CacheKeyBuilder.ORIFINAL_STR_FN) {
                        /**
                         * If we override the original method, we must use toString() value for identifying the object
                         */
                        this.parts.push(part);
                    } else {
                        this.appendObjectName(part);
                    }
                }
            }
        });
        return this;
    }

    public build():string {
        return this.parts.join('.');
    }
}

export function getLocale(): string {
    if (typeof window !== 'undefined' && !isBlank(window['$$CACHE_LOCALE'])) {
        return window['$$CACHE_LOCALE'];
    }

    let navigatorLanguages: Array<string> = navigator['languages'],
        currentLang;

    if (navigatorLanguages && navigatorLanguages.length) {
        currentLang = navigatorLanguages[0];
    } else {
        currentLang = navigator['userLanguage']
            || navigator.language
            || navigator['browserLanguage']
            || navigator['systemLanguage'];
    }
    return currentLang;
}
