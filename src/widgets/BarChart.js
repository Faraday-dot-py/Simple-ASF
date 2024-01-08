import { Chart } from "react-google-charts";
export const data = [
  ["Points", "Total"],
  ["Amp", 2],
  ["Speaker", 11],
  ["Trap", 2],
  ["Climb", 2],
  ["Park", 2],
];
export const options = {
  title: "My Daily Activities",
};

const charts = () => {
  return (
    <Chart
      chartType="BarChart"
      data={data}
      options={options}
      width={"100%"}
      height={"400px"}
    />
  )
}
export default charts