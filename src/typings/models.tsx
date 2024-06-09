
export interface ActivityMeta {
    label: string;
    fillColor: string;
  }
  
  export interface Activity {
    name: string;
    value: string;
  }
  
  export interface DayWiseActivityItem {
    count: string;
    label: string;
    fillColor: string;
  }
  
  export interface DayWiseActivity {
    date: string;
    items: {
      children: DayWiseActivityItem[];
    };
  }
  
  export interface Row {
    name: string;
    totalActivity: Activity[];
    dayWiseActivity: DayWiseActivity[];
    activeDays: {
      days: number;
      isBurnOut: boolean;
      insight: string[];
    };
  }
  
  export interface AuthorWorklog {
    activityMeta: ActivityMeta[];
    rows: Row[];
  }
  
  export interface Activity {
    name: string;
    value: string;
  }
  
  export interface DayWiseActivityItem {
    count: string;
    label: string;
    fillColor: string;
  }
  
  export interface DayWiseActivity {
    date: string;
    items: {
      children: DayWiseActivityItem[];
    };
  }
  
  export interface ActiveDays {
    days: number;
    isBurnOut: boolean;
    insight: string[];
  }
  
  export interface Row {
    name: string;
    totalActivity: Activity[];
    dayWiseActivity: DayWiseActivity[];
    activeDays: ActiveDays;
  }
  
  export interface TransformedRow {
    name: string;
    activeDays: number;
    dayWiseActivity: [
      { date: string; items: { children: DayWiseActivityItem[] } }
    ];
  }