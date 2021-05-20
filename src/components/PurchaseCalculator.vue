<template>
    <div class="calculator__views-wrapper">
        <div class="col-1">
            <!-- Home Price -->
            <div class="input-group">
                <!-- Home Price manual input -->
                <div class="label-block">
                    <label for="homePrice">Home Price</label>
                    <span>$</span>
                    <input
                        type="text"
                        class="homePrice-value inline-input"
                        v-model="homePrice"
                        @input="homePriceChanged"
                        id="homePrice"
                    />
                </div>
                <!-- Home price slider input -->
                <input
                    type="range"
                    min="80000"
                    max="999999"
                    step="1"
                    class="slider"
                    :style="fillSlider"
                    title="Select Home Price"
                    v-model="homePrice"
                    @input="homePriceChanged"
                />
            </div>

            <!-- Down Payment -->
            <div class="input-group downPmt">
                <label for="downPayment">Down Payment</label>
                <div class="label-block downPmt">
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="downPmt"
                        id="downPayment"
                        @input="downPmtChanged"
                    />
                    <input
                        type="text"
                        v-model="downPmtPercent"
                        title="Down Payment Percentage"
                        @input="downPmtPercentChanged"
                    />
                    <span class="appendPercent">%</span>
                </div>
            </div>

            <!-- Length of loan -->
            <div class="input-group loanLength">
                <label for="loanLength">Length of Loan</label>
                <select
                    v-model="loanLength"
                    @change="update"
                    id="loanLength"
                    class="form-select"
                >
                    <option disabled="disabled">Please select one</option>
                    <option value="360">30 Years</option>
                    <option value="240">20 Years</option>
                    <option value="180">15 Years</option>
                    <option value="120">10 Years</option>
                </select>
            </div>

            <!-- Interest Rate -->
            <div class="input-group intRate">
                <label for="interestRate">Interest Rate</label>
                <div class="label-block intRate">
                    <input
                        type="text"
                        step="0.01"
                        v-model="intRate"
                        id="interestRate"
                        @input="update"
                    />
                    <span class="appendPercent">%</span>
                </div>
            </div>
        </div>

        <div
            class="col-2"
            v-if="utility == 'Breakdown'"
        >
            <!-- Est. Monthly Payment -->
            <div class="input-group">
                <div class="label-block">
                    <label>Estimated Monthly Payment</label>
                    <span>$</span>
                    <span class="estPmt-value">{{ estMonthlyPmt.toLocaleString() }}</span>
                </div>
            </div>

            <!-- Principal & Interest -->
            <div class="principalAndInterest">
                <span class="colorCode"></span>
                <label>Principal & Interest</label>
                <span class="value">${{ pAndI.toLocaleString() }}</span>
            </div>

            <!-- Home Insurance -->
            <div class="homeInsurance">
                <span class="colorCode"></span>
                <label for="homeInsurance">Homeowner's Insurance</label>
                <div class="feeInputBlock">
                    <span class="prependPlus">+</span>
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="homeInsuranceValidated"
                        id="homeInsurance"
                        @input="update"
                    />
                </div>
            </div>

            <!-- Property Tax -->
            <div class="propTax">
                <span class="colorCode"></span>
                <label for="propertyTax">Property Tax</label>
                <div class="feeInputBlock">
                    <span class="prependPlus">+</span>
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="propertyTaxValidated"
                        id="propertyTax"
                        @input="update"
                    />
                </div>
            </div>

            <!-- HOA Fees -->
            <div class="hoaFees">
                <span class="colorCode"></span>
                <label for="hoaFees">HOA Fees</label>
                <div class="feeInputBlock">
                    <span class="prependPlus">+</span>
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="hoaFeesValidated"
                        id="hoaFees"
                        @input="update"
                    />
                </div>
            </div>
        </div>

        <!-- Chart -->
        <div
            class="col-3"
            v-if="utility == 'Breakdown'"
        >
            <div class="chartWrapper">
                <div class="label-block">
                    <span>$</span>
                    <span class="estPmt-value doughnut-label">{{ estMonthlyPmt }}</span>
                    <span>Monthly Payment</span>
                </div>
                <doughnut-chart
                    :chart-data="chartData"
                    :options="options"
                    class="doughnut-chart"
                />
            </div>
        </div>
        <amortization-schedule
            v-if="utility === 'Amortization'"
            :calcMonthlyPmt="parseFloat(calcMonthlyPmt)"
            :fees="parseFloat(fees)"
            :intRate="parseFloat(intRate)"
            :loanLength="parseInt(loanLength)"
            :principle="parseFloat(homePrice - downPmt)"
        />
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

import DoughnutChart from "./DoughnutChart.vue";
import AmortizationSchedule from "./AmortizationSchedule.vue";

export default {
    name: "PurchaseCalculator",
    components: {
        "doughnut-chart": DoughnutChart,
        "amortization-schedule": AmortizationSchedule,
    },

    data() {
        return {
            homePrice: "165000",
            estMonthlyPmt: "842",
            downPmt: "33000",
            downPmtPercent: 20.0,
            loanLength: 360,
            intRate: 3.9,
            homeInsurance: "100",
            propertyTax: "120",
            hoaFees: "0",
            fees: "0",
            options: {
                legend: false,
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 70,
            },
        };
    },

    computed: {
        ...mapState(["utility"]),
        calcMonthlyPmt() {
            let P = this.homePrice - this.downPmt;
            let r = parseFloat(this.intRate / 1200);
            let N = parseInt(this.loanLength);

            return Math.round(
                r == 0
                    ? P / N + this.fees
                    : (P * (r * Math.pow(1 + r, N))) /
                          (Math.pow(1 + r, N) - 1) +
                          this.fees
            );
        },
        calcDownPmt() {
            return Math.round(
                Number(this.homePrice) * (Number(this.downPmtPercent) * 0.01)
            );
        },
        calcDownPmtPercent() {
            return ((this.downPmt / this.homePrice) * 100).toFixed(2);
        },
        pAndI() {
            return (
                this.estMonthlyPmt -
                this.hoaFees -
                this.propertyTax -
                this.homeInsurance
            );
        },
        fillSlider() {
            return {
                "--val": this.homePrice,
            };
        },
        homeInsuranceValidated: {
            get() {
                return this.homeInsurance;
            },

            set(value) {
                if (value.length > 6) {
                    this.homeInsurance = value.slice(0, -1);
                } else {
                    this.homeInsurance = value;
                }

                this.homeInsurance = this.homeInsurance.replace(/[^0-9]/g, "");
            },
        },
        propertyTaxValidated: {
            get() {
                return this.propertyTax;
            },

            set(value) {
                if (value.length > 6) {
                    this.propertyTax = value.slice(0, -1);
                } else {
                    this.propertyTax = value;
                }

                this.propertyTax = this.propertyTax.replace(/[^0-9]/g, "");
            },
        },
        hoaFeesValidated: {
            get() {
                return this.hoaFees;
            },

            set(value) {
                if (value.length > 6) {
                    this.hoaFees = value.slice(0, -1);
                } else {
                    this.hoaFees = value;
                }

                this.hoaFees = this.hoaFees.replace(/[^0-9]/g, "");
            },
        },
        chartData() {
            return {
                labels: [
                    "Principal & Interest",
                    "Homeowner's Insurance",
                    "Property Tax",
                    "HOA Fees",
                ],
                datasets: [
                    {
                        backgroundColor: [
                            "#132e42",
                            "#08485c",
                            "#108c73",
                            "#16af8c",
                        ],
                        borderColor: "#fff",
                        //Data to be represented on y-axis
                        data: [
                            this.pAndI,
                            this.homeInsurance,
                            this.propertyTax,
                            this.hoaFees,
                        ],
                    },
                ],
            };
        }
    },

    methods: {
        homePriceChanged() {
            if (this.homePrice.length > 7) {
                this.homePrice = this.homePrice.slice(0, -1);
            }
            this.homePrice = this.homePrice.replace(/[^0-9]/g, "");
            this.downPmt = this.calcDownPmt;
            this.update();
        },
        downPmtChanged() {
            if (this.downPmt.length > 7) {
                this.downPmt = this.downPmt.slice(0, -1);
            }

            if (Number(this.downPmt) > Number(this.homePrice)) {
                this.downPmt = this.homePrice;
            }

            this.downPmt = this.downPmt.replace(/[^0-9]/g, "");
            this.downPmtPercent = this.calcDownPmtPercent;
            this.update();
        },
        downPmtPercentChanged() {
            if (this.downPmtPercent > 100) {
                this.downPmtPercent = 100.0;
            }
            this.downPmt = this.calcDownPmt;
            this.update();
        },
        update() {
            if (this.intRate.length > 5) {
                this.intRate = this.intRate.slice(0, -1);
            }
            this.intRate = this.intRate.toString().replace(/[^0-9.]/g, "");
            this.fees =
                Number(this.hoaFees) +
                Number(this.homeInsurance) +
                Number(this.propertyTax);
            this.estMonthlyPmt = this.calcMonthlyPmt;
        },
    },
};
</script>

<style lang="scss" scoped>
.calculator {
    .prependDollar {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 1rem;
    }
    .appendPercent {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 1rem;
        color: $gray-icon;
    }
    .col-1 {
        width: 28%;
        padding-right: 4%;
        border-right: 1px solid $gray-copy;
        @include breakpoint(ipadPro) {
            width: 45%;
            border-right: none;
        }
        @include breakpoint(tablet-land) {
            width: 100%;
            padding-right: 0;
            border: none;
        }
        .input-group {
            margin-bottom: 4rem;
            @include breakpoint(tablet-land) {
                margin-bottom: 2rem;
            }
        }
        .downPmt input {
            height: 4.5rem;
            padding-left: 2.5rem;
            color: $dark-blue;
            font-weight: 600;
            border: 1px solid $gray-icon;
            font-size: 2.2rem;
            &:last-of-type {
                padding-left: 1rem;
                min-width: 8.5rem;
                border: 1px solid $gray-icon;
                border-left: none;
            }
        }
        .loanLength {
            label {
                display: block;
            }
            .form-select {
                height: 4.5rem;
                width: 100%;
                font-size: 2.2rem;
                color: $dark-blue;
                font-weight: 600;
                padding-left: 0.5rem;
            }
        }
        .intRate {
            label {
                display: block;
            }
            div {
                position: relative;
            }
            input {
                height: 4.5rem;
                width: 100%;
                font-size: 2.2rem;
                color: $dark-blue;
                border: 1px solid $gray-icon;
                font-weight: 600;
                padding-left: 0.5rem;
            }
        }
    }
    .input-group {
        margin-bottom: 3rem;
        .label-block {
            position: relative;
            display: flex;
            align-items: flex-start;
            label {
                padding-top: 5px;
                margin-right: auto;
                @include breakpoint(tablet-land) {
                    margin-right: 2rem;
                }
            }
            span {
                color: $gray-icon;
                &:not(:last-child) {
                    margin-right: 0.5rem;
                }
            }
            .homePrice-value {
                color: $dark-blue;
                font-weight: 700;
                font-size: 3rem;
                width: 12.5rem;
            }
            .estPmt-value {
                color: $orange;
                font-weight: 700;
                font-size: 4rem;
            }
            &.downPmt {
                input:first-of-type {
                    width: 65%;
                }
                input:last-of-type {
                    width: 35%;
                }
            }
        }
    }
}
.slider {
    --min: 80000;
    --max: 999999;
    --val: 165000;
}
.advancedToggle {
    color: $teal;
    text-decoration: underline;
    font-style: italic;
}
.inline-input {
    border: none;
    background-color: transparent;
    display: inline-block;
    outline: none;
}
</style>
