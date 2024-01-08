import { Chart } from "react-google-charts";
export const data = [
  ["Points", "Total"],
  ["Amp", 11],
  ["Speaker", 2],
  ["Trap", 2],
  ["Climb", 2],
  ["Park", 7],
];
export const options = {
  title: "Point distribution",
};

const charts = () => {
  return (
    <Chart
      chartType="PieChart"
      data={data}
      options={options}
      width={"100%"}
      height={"400px"}
    />
  )
}
export default charts