import axios from "axios";
import { useEffect, useState } from "react";
import ReTable from "../components/ReTable/ReTable";
import { useNavigate } from "react-router-dom";
import CircularPackingChart from "../components/Graphs/CircularPacking/CircularPacking";
import { AuthorWorklog, Row, TransformedRow } from "../typings/models";
import BarChart from "../components/Graphs/BarChart/BarChart";
import DoughnutChart from "../components/Graphs/DoughnutChart/DoughnutChart";
import { RefreshIcon } from "../Icons/Icons";
import DataSpinner from "../components/Spinner/Spinner";

function Dashboard() {
  // states
  const [data, setData] = useState<AuthorWorklog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [filteredDates, setFilteredDates] = useState<string[]>([]);

  // other hooks
  const navigate = useNavigate();

  // effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://dev-bnbqslj1a7oi3i6.api.raw-labs.com/mock/json-api"
        );
        setData(response?.data?.data?.AuthorWorklog);
        console.log(response?.data?.data?.AuthorWorklog);

        setLoading(false);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          navigate("/fallback");
          setError("Too many requests");
        } else {
          setError("Error fetching data");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  // handlers and

  const transformData = (rows: Row[]): { sortedDates: string[] } => {
    const dates = new Set<string>();
    rows.forEach((row) => {
      row.dayWiseActivity.forEach((activity) => {
        dates.add(activity.date);
      });
    });
    const sortedDates = Array.from(dates).sort();
    return { sortedDates };
  };

  const { sortedDates } = transformData(data?.rows || []);

  const groupDatesByWeek = (dates: string[]): { [key: string]: string[] } => {
    const weeks: { [key: string]: string[] } = {};
    let currentWeek: string[] = [];

    dates.forEach((date, index) => {
      currentWeek.push(date);

      const dayOfWeek = new Date(date).getDay();

      if (dayOfWeek === 0 || index === dates.length - 1) {
        const weekLabel = `${currentWeek[0]} - ${
          currentWeek[currentWeek.length - 1]
        }`;
        weeks[weekLabel] = currentWeek;
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = groupDatesByWeek(sortedDates);

  const filterDataByWeek = (week: string, rows: Row[]): Row[] => {
    const [start, end] = week.split(" - ");
    return rows.map((row) => {
      const filteredActivities = row.dayWiseActivity.filter((activity) => {
        const activityDate = new Date(activity.date);
        return activityDate >= new Date(start) && activityDate <= new Date(end);
      });
      return { ...row, dayWiseActivity: filteredActivities };
    });
  };

  const filterDatesByWeek = (week: string, dates: string[]): string[] => {
    const [start, end] = week.split(" - ");
    return dates.filter((date) => {
      const activityDate = new Date(date);
      return activityDate >= new Date(start) && activityDate <= new Date(end);
    });
  };

  useEffect(() => {
    console.log("clo", selectedWeek, sortedDates);

    if (selectedWeek) {
      console.log("clo", selectedWeek, sortedDates, "in consition");
      setFilteredRows(filterDataByWeek(selectedWeek, data?.rows || []));
      setFilteredDates(filterDatesByWeek(selectedWeek, sortedDates));
    } else {
      setFilteredRows(data?.rows || []);
      setFilteredDates(sortedDates);
    }
  }, [selectedWeek, data, sortedDates]);

  const getTotalActivity = (
    data: Row[]
  ): {
    [key: string]: number;
  } => {
    const totals: {
      [key: string]: number;
    } = {};

    data.forEach((person) => {
      person.totalActivity.forEach((activity) => {
        if (!totals[activity.name]) {
          totals[activity.name] = 0;
        }
        totals[activity.name] += parseInt(activity.value, 10);
      });
    });

    return totals;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { day: "2-digit" });
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${day} ${weekday}`;
  };

  // renders
  const renderColorScheme = () => {
    return (
      <div className="legend">
        {data?.activityMeta.map((activity, index) => (
          <div className="chartLabel" key={index}>
            <div
              className="colorDiv"
              style={{ backgroundColor: activity.fillColor }}
            ></div>
            <span>{activity.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderActivityTable = () => {
    const columns: any = [
      {
        label: "",
        key: "name",
        render: (data: any) => {
          return (
            <>
              {data?.name}
              <span
                className="emoji"
                title={
                  data?.activeDays?.isBurnOut ? "Burnout" : "Not Burnt Out"
                }
              >
                {data?.activeDays?.isBurnOut ? <>&#128293;</> : <>&#128512;</>}
              </span>
            </>
          );
        },
      },
      ...filteredDates.map((date) => ({
        label: formatDate(date),
        key: date,
        render: (row: TransformedRow) => {
          console.log(row?.dayWiseActivity, date, row?.name);
          let cellData =
            row?.dayWiseActivity &&
            row?.dayWiseActivity?.find((item: any) => item.date === date);
          console.log(cellData?.items?.children?.[0]);
          return (
            <div>
              {cellData?.items?.children && (
                <CircularPackingChart data={cellData?.items} />
              )}
            </div>
          );
        },
      })),
    ];

    const renderWeekFilter = () => {
      const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedWeek(event.target.value);
      };
      return (
        <div>
          <label>Select Week</label>
          <select value={selectedWeek} onChange={handleChange}>
            <option value="">Select</option>
            {Object.keys(weeks).map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
          <p>You selected: {selectedWeek}</p>
        </div>
      );
    };

    return (
      <div className="dayWiseActivityTable">
        {renderWeekFilter()}
        {filteredRows && (
          <ReTable
            data={filteredRows}
            columns={columns}
            loading={loading}
            error={error}
          />
        )}
      </div>
    );
  };

  // returns
  if (loading) {
    return (
      <div>
        <DataSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="FallBackScreenWrapper">
        <h1>&#10060;{error}</h1>
      </div>
    );
  }
  return (
    <div className="DashboardWrapper">
      <div className="navBar">
        <div>Activity Tracker</div>

        <button
          className="btns"
          onClick={() => {
            setRefresh(refresh + 1);
          }}
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="body">
        {renderColorScheme()}
        {renderActivityTable()}
      </div>
    </div>
  );
}

export default Dashboard;
