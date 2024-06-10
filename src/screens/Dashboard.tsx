import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import ReTable from "../components/ReTable/ReTable";
import { useNavigate } from "react-router-dom";
import CircularPackingChart from "../components/Graphs/CircularPacking/CircularPacking";
import { AuthorWorklog, Row, TransformedRow } from "../typings/models";
import { RefreshIcon } from "../Icons/Icons";
import DataSpinner from "../components/Spinner/Spinner";
import BarChartCustom from "../components/Graphs/BarChart/BarChart";
import DonutChart from "../components/Graphs/DoughnutChart/DoughnutChart";
import {
  donutOptions,
  formatDate,
  plugins,
} from "../utilities/utilitiesCommon";

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

  // handlers and vars

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

  const weeks = useMemo(() => groupDatesByWeek(sortedDates), [sortedDates]);

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
      console.log("inconsi", filterDataByWeek(selectedWeek, data?.rows || []));
      setFilteredRows(filterDataByWeek(selectedWeek, data?.rows || []));
      setFilteredDates(filterDatesByWeek(selectedWeek, sortedDates));
    } else {
      setFilteredRows(data?.rows || []);
      // setFilteredRows(filterDataByWeek(selectedWeek, data?.rows || []));

      setFilteredDates(sortedDates);
    }
  }, [selectedWeek, data]);

  const getTotalActivity = (): {
    labels: string[];
    counts: number[];
    colors: string[];
  } => {
    const totals: { [key: string]: number } = {};
    const colors: { [key: string]: string } = {};

    data?.rows?.forEach((person) => {
      person.totalActivity.forEach((activity) => {
        if (!totals[activity.name]) {
          totals[activity.name] = 0;
        }
        totals[activity.name] += parseInt(activity.value, 10);
      });
    });

    data?.activityMeta.forEach((meta) => {
      colors[meta.label] = meta.fillColor;
    });

    const labels = Object.keys(totals);
    const counts = labels.map((label) => totals[label]);
    const colorsArray = labels.map((label) => colors[label] || "#000");

    return {
      labels,
      counts,
      colors: colorsArray,
    };
  };

  const totalActivity = getTotalActivity();

  const extractNamesAndActiveDays = () => {
    const names: any = [];
    const activeDays: any = [];

    data?.rows.forEach((person) => {
      names.push(person.name.split("@")[0]);
      activeDays.push(person.activeDays.days);
    });

    return { names, activeDays };
  };

  const { names, activeDays } = extractNamesAndActiveDays();

  // renders

  const columns: any = useMemo(
    () => [
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
      ...filteredDates.map((date, index) => ({
        label: formatDate(date),
        key: date,
        render: (row: TransformedRow) => {
          console.log(row, "ok", filteredRows, index);
          let cellData =
            row?.dayWiseActivity &&
            row?.dayWiseActivity?.find((item: any) => item.date === date);
          return (
            <div>
              {cellData?.items?.children && (
                <CircularPackingChart data={cellData?.items} />
              )}
            </div>
          );
        },
      })),
    ],
    [filteredDates]
  );

  const renderActivityTable = () => {
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
        </div>
      );
    };

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

    return (
      <div className="dayWiseActivityTable">
        {/* {renderWeekFilter()} */}
        <div className="tableTitle">Day wise Activity Log Of Team Members</div>
        {renderColorScheme()}

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

  const renderBarChart = () => {
    const chartData = {
      labels: totalActivity.labels,
      datasets: [
        {
          label: "Total",
          data: totalActivity.counts,
          backgroundColor: totalActivity.colors,
          hoverBackgroundColor: "blue",
          borderRadius: 4,
          barThickness: 20,
        },
      ],
    };

    return (
      <>
        <div className="summaryChart">
          <div className="qualityTit">
            <div>
              <p className="maintit">Total Activity</p>
            </div>
          </div>
          {data?.rows && (
            <div className="BarChart">
              {loading ? (
                <DataSpinner />
              ) : data?.rows ? (
                <BarChartCustom chartData={chartData} />
              ) : (
                <>No Data</>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderActiveDays = () => {
    const chartData = {
      labels: names,
      datasets: [
        {
          label: "Total",
          data: activeDays,
          backgroundColor: totalActivity.colors,
          hoverBackgroundColor: "blue",
          borderRadius: 4,
          barThickness: 20,
        },
      ],
    };

    return (
      <>
        <div className="summaryChart">
          <div className="qualityTit">
            <div>
              <p className="maintit">Total Active Days</p>
            </div>
          </div>
          {data?.rows && (
            <div className="BarChart">
              {loading ? (
                <DataSpinner />
              ) : data?.rows ? (
                <BarChartCustom chartData={chartData} />
              ) : (
                <>No Data</>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const calculation = useMemo(
    () => (
      <div className="summaryChart">
        <div className="qualityTit">
          <div>
            <p className="maintit">Burnout %</p>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
         
          <div className="donutCanvas">
            <DonutChart
              type="Transaction scheme"
              chartDataSetProps={[
                {
                  trxSum: 300,
                  label: ["Trx Count"],
                  labels: ["Burnout %", "Not BurntOut%"],
                  data: [25, 75],
                  backgroundColor: [`#FAC76E`, `#0396A6`, `red`],
                  borderColor: [`#FAC76E`, `#0396A6`, `red`],
                  hoverOffset: 2,
                  borderWidth: 1,
                  spacing: 1,
                  borderAlign: "center",
                },
              ]}
              options={donutOptions}
              plugins={plugins}
            />
          </div>
        </div>
      </div>
    ),
    [data?.rows]
  );

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
        <div className="tableTitle">Summary</div>

        <div className="summary">
          {renderBarChart()}
          <div>{data?.rows && calculation}</div>
          {renderActiveDays()}
        </div>

        {renderActivityTable()}
      </div>
    </div>
  );
}

export default Dashboard;
