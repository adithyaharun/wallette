import dayjs from "dayjs";
import { MonthPicker } from "../../components/ui/month-picker";
import { useDashboardFilterContext } from "./page";

export function DashboardHeader() {
  const { date, setDate } = useDashboardFilterContext();

  const currentTime = dayjs();
  const period = (() => {
    if (
      currentTime.date() === 1 &&
      currentTime.hour() >= 0 &&
      currentTime.hour() < 5
    ) {
      return "Happy New Year";
    } else if (currentTime.date() === 25 && currentTime.month() === 11) {
      return "Merry Christmas";
    } else if (currentTime.hour() >= 5 && currentTime.hour() < 12) {
      return "Good morning";
    } else if (currentTime.hour() >= 12 && currentTime.hour() < 18) {
      return "Good afternoon";
    } else if (currentTime.hour() >= 18 && currentTime.hour() < 22) {
      return "Good evening";
    } else {
      return "Good night";
    }
  })();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{period},</h1>
        <p className="text-muted-foreground">
          Here is the overview of your financial situation.
        </p>
      </div>
      <div>
        <MonthPicker
          value={date}
          onValueChange={(date) => setDate(date || dayjs())}
          format="MMM YYYY"
        />
      </div>
    </div>
  );
}
