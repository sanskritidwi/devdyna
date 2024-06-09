import React, {
  ReactNode,
  useState,
  ChangeEvent,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";


// import DataSpinner from "../../CustomComponent/Spinner/Spinner";
import "./ReTable.scss";

interface TableColumn {
  label: string;
  key: string | number;
  className?: string;
  render?: (data: any) => ReactNode;
}


interface TableProps {
  data: any[];
  columns: TableColumn[];
 
  error?: string | undefined | null;
 
  loading?: boolean;

 
  showHeader?: boolean;
 
}

const ReTable: React.FC<TableProps> = ({
  data,
  columns,

  loading,



  showHeader = true,
  error,
}) => {

  const tableElement = useRef(null);
  var headerRef = useRef();


  const tableHeader: any[] = useMemo(() => {
    return columns.map((item, index) => ({
      label: item.label,
      key: index,
      ref: headerRef,
    }));
  }, [columns]);



  const getClassName = (data: any, value: any) => {
    if (data.key === "status") {
      switch (value) {
        case "success":
        case "Success":
          return "greenBg";
        case "failure":
        case "Failed":
          return "redBg";
        default:
          return "";
      }
    } else if (data.key === "reconcilationStatus") {
      switch (value) {
        case "Success":
          return "greenBg";
        case "Not_Settled":
          return "redBg";
        default:
          return "";
      }
    } else if (data.key === "matched") {
      switch (value) {
        case "Matched":
          return "green";
        case "Not_Settled":
          return "redBg";
        default:
          return "";
      }
    } else {
      return data.className;
    }
  };

  const renderCell = (data: any, key: string | number) => {
    if (data === null) {
      return <>-</>;
    } else if (typeof data === "number") {
      return data.toString();
    } else if (typeof data === "boolean") {
      return data ? "Yes" : "No";
    } else if (typeof data === "string") {
      return data;
    }
  };



  return (
    <div className="ReTableWrapper">
      <div className="TableWrapper">
        <div className="tableWrapper">
          <table className="table" ref={tableElement}>
            {showHeader && (
              <thead className="thead">
                <tr>
                  {tableHeader?.map((column, index) => (
                    <th key={index} ref={column.ref}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {loading ? (
              <tbody className="tbody">
                <tr>
                  <td colSpan={columns.length}>
                    {/* <DataSpinner />  */}
                    Loading ...
                  </td>
                </tr>
              </tbody>
            ) : !loading && error ? (
              <tbody className="tbody">
                <tr>
                  <td colSpan={columns.length} className="statusError">
                    {error}
                  </td>
                </tr>
              </tbody>
            ) : data?.length ? (
              <tbody className="tbody">
                {data?.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      {columns?.map((column, index) => (
                        <td
                          key={index}
                          className={getClassName(column, item[column.key])}
                        >
                          {column.render
                            ? column.render(item)
                            : renderCell(item, column.key)}

                          {!(column.key === "cardType") && !column.render && (
                            <>{item[column.key]}</>
                          )}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            ) : (
              <></>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReTable;
