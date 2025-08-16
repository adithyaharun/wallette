import dayjs from "dayjs";
import { useUI } from "../../components/providers/ui-provider";
import { MonthPicker } from "../../components/ui/month-picker";
import { useDashboardFilterContext } from "./page";

export function DashboardHeader() {
  const { date, setDate } = useDashboardFilterContext();
  const { config } = useUI();

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
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
      <div className="flex-1">
        <h1 className="text-xl md:text-3xl font-bold">{`${period},${config?.name ? ` ${config?.name}` : ""}`}</h1>
        <p className="text-sm md:text-md text-muted-foreground">
          Here is the overview of your financial situation.
        </p>
      </div>
      <div className="w-full md:w-auto">
        <MonthPicker
          buttonClassName="w-full justify-center"
          value={date}
          onValueChange={(date) => setDate(date || dayjs())}
          format="MMM YYYY"
        />
      </div>
    </div>
  );
}
