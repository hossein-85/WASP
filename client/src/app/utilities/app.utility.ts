import { Injectable } from '@angular/core';

@Injectable()
export class AppUtility {

    public static mapValuesToArray(source: Object): Object[] {
        return Object.keys(source).map((key) => source[key]);
    }
}
