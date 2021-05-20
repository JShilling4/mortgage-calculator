<script>
import Chart from "chart.js";
import { generateChart, mixins } from "vue-chartjs";

/**
 * Start Here
 * For more info getting started, refer to https://vue-chartjs.org/guide/#custom-new-charts for a basic understanding
 */

const { reactiveProp } = mixins;

/**
 * Line Controller
 * You can name your new controller anything
 * https://www.chartjs.org/docs/latest/developers/charts.html#extending-existing-chart-types
 */

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
    /**
     * Draw Override
     * Line controller override for new chart using chart.js
     * https://stackoverflow.com/questions/47175848/how-to-add-a-vertical-line-on-chart-js-when-hover-a-point
     * @param ease
     */
    draw: function (ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);

        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
            let activePoint = this.chart.tooltip._active[0],
                ctx = this.chart.ctx,
                x = activePoint.tooltipPosition().x,
                topY = this.chart.scales["y-axis-0"].top,
                bottomY = this.chart.scales["y-axis-0"].bottom;

            /**
             * Center Line
             * This line slides on the x-axis on hover and indicates the dollar figure for each line associated
             */
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#001b2b"; // $darkest-blue: #001b2b;
            ctx.stroke();
            ctx.restore();

            /**
             * Active point display
             * This loop creates any hovered points by using mode index and position intersect in the chart.js config and
             * returning each active line's x & y coords. To get the color you must include the property point color in
             * your parent's dataset.
             */
            // debugger
            ctx.save();
            this.chart.tooltip._active.forEach((tooltipPoint) => {
                // cache dataset index
                let di = tooltipPoint._datasetIndex;
                // create canvas point with data from chartjs
                ctx.beginPath();
                // creates a circle
                // https://www.w3schools.com/tags/canvas_arc.asp
                ctx.arc(
                    tooltipPoint._view.x,
                    tooltipPoint._view.y,
                    10,
                    0,
                    2 * Math.PI
                );
                ctx.lineWidth = 4;
                ctx.strokeStyle = this.chart.data.datasets[di].pointColor; // pointColor set in parent data transfer
                ctx.stroke();
                ctx.fillStyle = this.chart.data.datasets[di].pointColor;
                ctx.fill();
            });
            ctx.restore();

            /**
             * Bottom date functionality
             * This places the associated x-axis date label below the chart where the line is indicating the position. The
             * date will not move beyond the chart.
             * Code removed creates a pill background.
             * https://stackoverflow.com/questions/48875091/chartjs-double-tooltip-top-and-bottom-on-hover
             */
            const value = this.chart.data.labels[activePoint._index];
            ctx.font =
                this.chart.options.tooltips.titleFontStyle +
                " " +
                this.chart.options.tooltips.titleFontSize +
                "px Avenir";
            const xPad = this.chart.options.tooltips.xPadding;
            const yPad = this.chart.options.tooltips.yPadding;
            const width = ctx.measureText(value).width + xPad * 2;
            // const height = this.chart.options.tooltips.titleFontSize + yPad * 2;
            // const radius = this.chart.options.tooltips.cornerRadius;
            // console.log(activePoint, topY, xPad, yPad, ctx.font);
            ctx.fillStyle = this.chart.options.tooltips.backgroundColor;
            ctx.lineWidth = this.chart.options.tooltips.borderWidth;
            // const y = bottomY;

            // debugger
            // this is to make the date not hang outside the graph
            let repositionLeft = x - width / 2;
            let repositionRight = x + width / 2;
            if (
                repositionLeft < 0 &&
                repositionRight > this.chart.scales["x-axis-0"].right
            ) {
                x = repositionRight;
            } else if (
                repositionLeft > 0 &&
                repositionRight > this.chart.scales["x-axis-0"].right
            ) {
                x = x - width;
            } else if (repositionLeft > 0) {
                x = repositionLeft;
            }

            ctx.textBaseline = "top";
            ctx.fillStyle = this.chart.options.tooltips.titleFontColor;
            ctx.fillText(value, x + xPad, bottomY + yPad + 15);

            /**
             * Value "props"
             * Due to this not being in vue, to pass the active values you must check if they exist and then set them to
             * their respective elements. Values can be set statically due the dataset existing at all times.
             */
            if (
                document.getElementById("amortizationBalance") ||
                document.getElementById("amortizationInterest") ||
                document.getElementById("amortizationPrinciple")
            ) {
                const activeBalanceDatasetIndex = 2;
                const activeInterestDatasetIndex = 1;
                const activePrincipleDatasetIndex = 0;
                if (this.chart.data.datasets[activeBalanceDatasetIndex]) {
                    document.getElementById("amortizationBalance").innerText =
                        "$" +
                        parseFloat(
                            this.chart.data.datasets[activeBalanceDatasetIndex]
                                .data[activePoint._index]
                        )
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    document.getElementById("amortizationBalance").innerText = "";
                }
                if (this.chart.data.datasets[activeInterestDatasetIndex]) {
                    document.getElementById("amortizationInterest").innerText =
                        "$" +
                        parseFloat(
                            this.chart.data.datasets[activeInterestDatasetIndex]
                                .data[activePoint._index]
                        )
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    document.getElementById("amortizationInterest").innerText = "";
                }
                if (this.chart.data.datasets[activeInterestDatasetIndex]) {
                    document.getElementById("amortizationPrinciple").innerText =
                        "$" +
                        parseFloat(
                            this.chart.data.datasets[
                                activePrincipleDatasetIndex
                            ].data[activePoint._index]
                        )
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    document.getElementById("amortizationPrinciple").innerText = "";
                }
                document.getElementById("amortizationDate").innerText = value;
            }
        }
    },
});

Chart.defaults.global.elements.point.borderWidth = 0;
Chart.defaults.global.elements.point.radius = 0;
Chart.defaults.global.elements.line.borderWidth = 0;
Chart.defaults.global.tooltips.enabled = false;

const CustomLine = generateChart("custom-line", "LineWithLine");

export default {
    extends: CustomLine,
    name: "LineChart",
    mixins: [reactiveProp],
    props: ["chartData"],
    data() {
        return {
            options: {
                tooltips: {
                    // bottom tooltip
                    mode: "index",
                    intersect: false,
                    backgroundColor: "transparent",
                    titleFontSize: 17,
                    titleFontColor: "#001b2b", // $darkest-blue: #001b2b;
                },
                spanGaps: true,
                maintainAspectRatio: false,
                hover: {
                    mode: "nearest",
                    intersect: true,
                },

                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 50,
                    },
                },
                scales: {
                    xAxes: [
                        {
                            display: false,
                        },
                    ],
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                                callback: function (value, index, values) {
                                    if (parseInt(value) >= 1000) {
                                        return (
                                            (value / 1000)
                                                .toString()
                                                .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                ) + "k"
                                        );
                                    } else {
                                        return value / 1000;
                                    }
                                },
                            },
                        },
                    ],
                },
                legend: {
                    display: true,
                },
            },
        };
    },
    mounted() {
        this.renderChart(this.chartData, this.options);
    },
};
</script>
<style lang="scss" scoped>
</style>
