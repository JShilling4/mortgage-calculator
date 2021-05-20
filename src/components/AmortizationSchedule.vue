

<template>
    <div class="amortization">
        <div class="graph">
            <div class="chart">
                <line-chart :chartData="fillData" />
            </div>
            <div class="values-container">
                <div class="col-2">
                    <label>My payment breakdown as of <span id="amortizationDate"></span></label>
                    <div class="list-group">
                        <span class="list-group__color-block list-group__color-block--light-teal"></span>
                        <label>
                            <span>Remaining Principle</span>
                            <span id="amortizationBalance"></span>
                        </label>
                    </div>
                    <div class="list-group">
                        <span class="list-group__color-block list-group__color-block--blue-green"></span>
                        <label>
                            <span>Paid Interest</span>
                            <span id="amortizationInterest"></span>
                        </label>
                    </div>
                    <div class="list-group">
                        <span class="list-group__color-block list-group__color-block--dark-blue"></span>
                        <label>
                            <span>Paid Principle</span>
                            <span id="amortizationPrinciple"></span>
                        </label>
                    </div>
                </div>
                <div class="col-3">
                    <label>Mortgage Payoff Date:</label>
                    <h4 class="payoff">{{ payoffDate }}</h4>
                </div>
            </div>
        </div>
        <div class="schedule">
            <div class="schedule__heading">
                <h4>Amortization Schedule</h4>
                <a
                    class="schedule__heading--link"
                    href="#"
                    onclick="window.print();return false;"
                >
                    <i class="fa fa-print"></i> Print Me
                </a>
            </div>
            <div class="table-container">
                <div
                    class="table"
                    v-on:scroll.passive="handleScroll"
                >
                    <table>
                        <thead>
                            <tr>
                                <th class="table__header table__header--wide">Date</th>
                                <th class="table__header table__header--narrow">Payment</th>
                                <th class="table__header table__header--narrow">Principle</th>
                                <th class="table__header table__header--narrow">Interest</th>
                                <th class="table__header table__header--narrow">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                :class="payment.year ? 'table__header--sticky' : ''"
                                v-for="(payment, index) in paymentSchedule"
                                :key="index"
                            >
                                <td>{{ payment.date }}</td>
                                <td>$ {{ payment.payment.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</td>
                                <td>$ {{ payment.principle.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</td>
                                <td>$ {{ payment.interest.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</td>
                                <td>$ {{ payment.balance.replace(/\B(?=(\d{3})+(?!\d))/g, ',') }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <transition name="slide-fade">
                    <div
                        class="table-container__scroll-notification"
                        v-if="scrollNotification"
                    >
                        <span>Scroll To View</span>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState } from "vuex";

import moment from "moment";
import LineChart from "./LineChart";

export default {
    name: "AmortizationSchedule",
    props: {
        principle: {
            type: Number,
            default: null,
        },
        loanLength: {
            type: Number,
            default: null,
        },
        intRate: {
            type: Number,
            default: null,
        },
        fees: {
            type: Number,
            default: null,
        },
        calcMonthlyPmt: {
            type: Number,
            default: null,
        },
    },
    components: {
        "line-chart": LineChart,
    },
    data() {
        return {
            dateScheduleArray: [],
            totalsPrincipleArray: [],
            totalsInterestArray: [],
            totalsPaymentArray: [],
            monthlyPayment: 0,
            startDate: moment(),
            scrollNotification: true,
        };
    },
    computed: {
        fillData() {
            /**
             * Data used in graph, calculated in calculateSchedule()
             */
            return {
                labels: this.dateScheduleArray,
                datasets: [
                    {
                        label: "Paid Principle",
                        backgroundColor: "rgba(243, 142, 54, .5)",
                        data: this.totalsPaymentArray,
                        pointColor: "#f38e36",
                    },
                    {
                        label: "Paid Interest",
                        backgroundColor: "rgba(8, 72, 92, .6)",
                        data: this.totalsInterestArray,
                        pointColor: "#08485c",
                    },
                    {
                        label: "Principle",
                        backgroundColor: "rgba(22, 175, 140, .5)",
                        data: this.totalsPrincipleArray,
                        pointColor: "#16af8c",
                    },
                ],
            };
        },

        payoffDate() {
            /**
             * Orange payoff date below graph
             */
            return moment(this.startDate)
                .add(this.loanLength, "months")
                .format("MMM DD, YYYY");
        },

        paymentSchedule() {
            /* eslint-disable vue/no-side-effects-in-computed-properties */
            /**
             * Set monthly payment
             * Set date for function or pass date for testing
             * Init all local variables for schedule build and data totals for fillData
             */
            this.monthlyPayment = this.calcMonthlyPmt - this.fees;
            let date = moment(this.startDate);
            let schedule = [];
            let principle = +parseFloat(this.principle).toFixed(2);
            let year = date.format("YYYY");
            let totalsPrinciple = 0,
                totalsInterest = 0,
                totalsPayment = 0;
            (this.totalsInterestArray = []),
                (this.totalsPaymentArray = []),
                (this.totalsPrincipleArray = []),
                (this.dateScheduleArray = []);
            /**
             * Loop over all months of loan starting at index 1
             */
            for (let i = 1; i <= this.loanLength; i++) {
                /**
                 * Reset date
                 * Reset interest payment
                 * Reset principle payment
                 */
                let date = moment(this.startDate);
                let interestPayment = +parseFloat(
                    principle * (this.intRate / 1200)
                ).toFixed(2);
                let principlePayment =
                    +parseFloat(
                        i == this.loanLength ? principle : this.monthlyPayment
                    ).toFixed(2) - interestPayment;
                /**
                 * Add loops index to date's month to check if it's the end of a year, if a totals object needs inserted
                 * before running the next month
                 */
                date.add(i, "months");
                if (date.format("YYYY") > year) {
                    /**
                     * Insert totals object (for all years before last year)
                     */
                    schedule.push({
                        date: "Totals (as of " + year + ")",
                        payment: parseFloat(totalsPayment).toFixed(2),
                        principle: parseFloat(totalsPrinciple).toFixed(2),
                        interest: parseFloat(totalsInterest).toFixed(2),
                        balance: parseFloat(principle).toFixed(2),
                        year: true,
                    });
                    /**
                     * Correct the year variable if the year has changed
                     */
                    year = date.format("YYYY");
                }
                /**
                 * Conditional logic for the last payment to add interest to the principle regardless of how much is due, and
                 * to calculate the new balance of the loan
                 */
                let finalPayment;
                let newPrinciple = principle - principlePayment;
                if (i == this.loanLength) {
                    finalPayment = principle + interestPayment;
                    principlePayment = principle;
                    principle = 0;
                } else {
                    principle = newPrinciple;
                    if (newPrinciple < 0) {
                        principle = 0;
                    }
                }
                /**
                 * Loop's index's month's statistics, use final payment unless not set (default to monthlyPayment
                 */
                schedule.push({
                    date: date.format("MMMM YYYY"),
                    payment: parseFloat(
                        finalPayment || this.monthlyPayment
                    ).toFixed(2),
                    principle: parseFloat(principlePayment).toFixed(2),
                    interest: parseFloat(interestPayment).toFixed(2),
                    balance: parseFloat(principle).toFixed(2),
                    year: false,
                });
                /**
                 * Process graph data while computing table data
                 */
                this.dateScheduleArray.push(date.format("MMM. D, YYYY"));
                totalsPrinciple += this.monthlyPayment - interestPayment;
                this.totalsPrincipleArray.push(
                    +parseFloat(principle).toFixed(2)
                );
                totalsInterest += +parseFloat(interestPayment).toFixed(2);
                this.totalsInterestArray.push(totalsInterest);
                totalsPayment += +parseFloat(this.monthlyPayment).toFixed(2);
                this.totalsPaymentArray.push(this.principle - principle);
                /**
                 * Insert unique totals object on the last year
                 */
                if (i == this.loanLength && finalPayment) {
                    /**
                     * Last year's totals object is calculated differently
                     */
                    schedule.push({
                        date: "Totals (as of " + year + ")",
                        payment: parseFloat(
                            totalsPayment + finalPayment - this.monthlyPayment
                        ).toFixed(2),
                        principle: parseFloat(
                            totalsPrinciple + finalPayment - this.monthlyPayment
                        ).toFixed(2),
                        interest: parseFloat(totalsInterest).toFixed(2),
                        balance: parseFloat(principle).toFixed(2),
                        year: true,
                    });
                }
            }
            return schedule;
        },
    },
    methods: {
        /**
         * Boolean defines animation on scroll effect placed on table bottom edge
         * @param {boolean} this.scrollNotification
         */
        handleScroll() {
            let obj = document.querySelector(".table__header--sticky");
            if (obj !== null) {
                let { top, bottom } = obj.getBoundingClientRect();
                let height = document.documentElement.clientHeight;
                this.scrollNotification = bottom + top > height;
            }
        },

    },
    mounted() {
        // this.calculateSchedule();
        this.handleScroll();
    }
};
</script>
<style lang="scss">
// Chrome > more tools > rendering > print media type
@media print {
    body > *:not(.header):not(#calculator),
    .header > *:not(.top-bar),
    .top-bar > *:not(a),
    #calculator > *:not(.calculator),
    .calculator__wrapper .calcNavbar,
    .calculator__wrapper .col-1,
    .graph,
    .schedule__heading--link,
    .table-container__scroll-notification {
        display: none !important;
    }
    .header {
        position: relative !important;
    }
    #calculator,
    .calculator {
        padding: 0 !important;
    }
    .table {
        margin-top: 3rem !important;
        max-height: 100% !important;
        overflow: unset !important;
    }
}

.slide-fade {
    &-enter-active {
        transition: all 0.3s ease;
    }

    &-leave-active {
        transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
    }

    &-enter, &-leave-to /* .slide-fade-leave-active below version 2.1.8 */ {
        transform: translateY(10px);
        opacity: 0;
    }
}

.col-1.amortization {
    @include breakpoint(ipadPro) {
        border: 0 !important;
        width: 100% !important;
        padding: 0 !important;
    }
}
</style>
<style lang="scss" scoped>
.amortization {
    width: 72%;
    @include breakpoint(ipadPro) {
        width: 100%;
    }

    .schedule {
        width: 100%;

        &__heading {
            display: flex;
            justify-content: space-between;
            @include breakpoint(ipadPro) {
                display: block;
            }

            &--link {
                padding-right: 1.6rem;
                margin: 0 3rem;
                color: $gray-copy;
                text-decoration: none;
                @include breakpoint(ipadPro) {
                    padding: 0;
                    width: 100%;
                    display: block;
                    margin: 0 0 3rem;
                }
            }
        }

        h4 {
            margin: 0 3rem;
            color: $main-font-color;
            @include breakpoint(ipadPro) {
                width: 100%;
                margin: 0 0 3rem;
            }
        }

        .table-container {
            position: relative;

            .table {
                max-height: 540px;
                overflow-y: auto;
                width: calc(100% - 6rem);
                margin: 3rem 3rem 0;
                position: relative;

                @include breakpoint(ipadPro) {
                    width: 100%;
                    margin: 0;
                }
            }

            .table-container__scroll-notification {
                display: flex;
                justify-content: center;
                align-items: center;
                color: $main-font-color;
                text-align: center;
                position: absolute;
                left: 0;
                right: 0;
                height: 13.6rem;
                bottom: 0;
                background: linear-gradient(
                    to bottom,
                    rgba(255, 255, 255, 0),
                    rgba(255, 255, 255, 0.98) 85%
                );
                z-index: 1;
                transition: all 1s;
            }

            table {
                text-align: left;
                position: relative;
                border-collapse: collapse;
                border-spacing: 0;
                width: 100%;
                font-size: 1.7rem;
                line-height: 3.1rem;
                color: $gray-copy;
                text-align: left;
                font-family: Avenir;

                .table__header {
                    font-size: 1.4rem;
                    line-height: 2.1rem;
                    letter-spacing: 0.1rem;
                    background-color: $gray-bg;
                    color: $main-font-color;
                    text-transform: capitalize;

                    &--wide {
                        min-width: 155px;
                    }

                    &--narrow {
                        min-width: 115px;
                    }

                    &:after {
                        content: "";
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 100%;
                        border-bottom: 0.1rem solid $gray-copy;
                        border-top: 0.1rem solid $gray-copy;
                    }
                }

                td,
                th {
                    padding: 0.7rem;
                    border-collapse: separate;
                }

                th,
                .table__header--sticky td {
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .table__header--sticky td {
                    top: 3.3rem;
                    @extend .table__header;
                }

                tbody td {
                    border: 0.1rem solid $gray-copy;
                    border-left: 0;
                    border-right: 0;
                }
            }
        }
    }

    .graph {
        margin-bottom: 3rem;
        position: relative;

        .chart {
            position: relative;
            margin: 3rem;
            width: calc(100% - 6rem);

            @include breakpoint(ipadPro) {
                margin: auto;
                width: 100%;
            }
        }

        .values-container {
            padding: 0 3rem 3rem;
            display: flex;

            @include breakpoint(ipadPro) {
                display: block;
                width: 100%;
                padding: 0;
            }

            > div {
                margin-bottom: 3rem;
            }

            .col-2 {
                display: block;
                @include breakpoint(ipadPro) {
                    width: 100%;
                    padding-left: 0;
                }
                flex: 1;

                > label {
                    display: block;
                    padding-bottom: 1.7rem;
                }
            }

            .col-3 {
                width: 39%;
                display: block;
                text-align: right;

                @include breakpoint(ipadPro) {
                    width: 100%;
                    text-align: left;
                }
                @include breakpoint(tablet-land) {
                    width: 100%;
                    order: 2;
                }
            }

            .payoff {
                padding-top: 1.7rem;
                color: $secondary-color;
            }

            .list-group {
                display: flex;
                align-items: center;
                border-bottom: 1px solid $gray-icon;
                padding: 1.5rem 0;

                label {
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                }

                .list-group__color-block {
                    display: inline-block;
                    height: 25px;
                    width: 25px;
                    min-width: 25px;
                    margin-right: 1.5rem;
                    border-radius: 5px;

                    &--light-teal {
                        background-color: $quaternary-color;
                    }

                    &--blue-green {
                        background-color: $tertiary-color;
                    }

                    &--dark-blue {
                        background-color: $secondary-color;
                    }
                }
            }
        }
    }
}

::-webkit-scrollbar {
    width: 14px;
    height: 18px;
}

::-webkit-scrollbar-button {
    width: 0;
    height: 0;
    display: none;
}

::-webkit-scrollbar-thumb {
    height: 6px;
    border: 4px solid transparent;
    background-clip: padding-box;
    border-radius: 7px;
    background-color: rgba(0, 0, 0, 0.15);
    -webkit-box-shadow: inset -1px -1px 0 rgba(0, 0, 0, 0.05),
        inset 1px 1px 0 rgba(0, 0, 0, 0.05);
    box-shadow: inset -1px -1px 0 rgba(0, 0, 0, 0.05),
        inset 1px 1px 0 rgba(0, 0, 0, 0.05);
}
</style>