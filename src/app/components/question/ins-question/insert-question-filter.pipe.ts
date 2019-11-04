import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'InsertQuestionFilterPipe' })
export class InsertQuestionFilterPipe implements PipeTransform {
  transform(value, args?): Array<any> {
    console.log(args);
    const searchText = new RegExp(args, 'ig');
    if (value) {
      return value.filter(item => {
          return (
            (item.question1.search(searchText) !== -1) ||
            (item.maxPoint.toString().search(searchText) !== -1)
          );
      });
    }
  }
}