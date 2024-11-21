import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "customDateAndTime"
})

export class DateAndTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date: Date = new Date(value);

    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day: number = date.getDate();
    const month: string = months[date.getMonth()];
    const year: number = date.getFullYear();

    let hours: number = date.getHours();
    const minutes: string = date.getMinutes().toString().padStart(2, '0');
    const ampm: "PM" | "AM" = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }
}
