declare module "react-native-calendars" {
  export interface DateObject {
    dateString: string;
    day: number;
    month: number;
    year: number;
  }

  export interface CalendarListProps {
    pastScrollRange?: number;
    futureScrollRange?: number;
    onDayPress?: (day: DateObject) => void;
    markedDates?: Record<
      string,
      {
        selected?: boolean;
        selectedColor?: string;
        selectedTextColor?: string;
      }
    >;
    firstDay?: number;
    theme?: Record<string, string>;
    style?: any;
  }

  export const CalendarList: any;
  export const LocaleConfig: any;
}
