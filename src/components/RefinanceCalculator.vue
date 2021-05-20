<template>
    <div class="calculator__views-wrapper">
        <div class="col-1">
            <!-- Home Value -->
            <div class="input-group">
                <!-- Home value (manual input) -->
                <div class="label-block">
                    <label for="homeValue">Home Value</label>
                    <div class="currencyGroup">
                        <span>$</span>
                        <input
                            type="text"
                            class="homePrice-value inline-input"
                            v-model="homeValueValidated"
                            id="homeValue"
                            @input="homeValueChanged"
                        />
                    </div>
                </div>
                <!-- Home value (slider input) -->
                <input
                    type="range"
                    min="80000"
                    max="999999"
                    step="1"
                    class="slider"
                    title="Home Value"
                    :style="fillSlider"
                    v-model="homeValueValidated"
                    @input="homeValueChanged"
                />
            </div>

            <!-- Mortgage Balance -->
            <div class="input-group mortBalance">
                <div class="dualLabel">
                    <label for="mortgageBalance">Mortgage Balance</label>
                    <label for="mortBalPercent">New Rate</label>
                </div>
                <div class="label-block mortBalance">
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="mortBalanceValidated"
                        id="mortgageBalance"
                        @input="update"
                    />
                    <input
                        type="text"
                        step="0.01"
                        v-model="rateValidated"
                        id="mortBalPercent"
                        @input="update"
                    />
                    <span class="appendPercent">%</span>
                </div>
            </div>

            <!-- Length of loan -->
            <div class="input-group loanLength">
                <label for="loanLength">Length of Loan</label>
                <select
                    v-model="loanLength"
                    class="form-select"
                    id="loanLength"
                    @change="update"
                >
                    <option disabled="disabled">Please select one</option>
                    <option value="360">30 Years</option>
                    <option value="240">20 Years</option>
                    <option value="180">15 Years</option>
                    <option value="120">10 Years</option>
                </select>
            </div>

            <!-- CashOut / LTV -->
            <div class="input-group mortBalance dualInput">
                <div class="dualLabel">
                    <label for="cashOut">Cash Out</label>
                    <label for="ltvPercent">LTV</label>
                </div>
                <div class="label-block mortBalance">
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="cashOutValidated"
                        id="cashOut"
                        @input="cashoutChanged"
                    />
                    <input
                        type="number"
                        v-model="ltv"
                        id="ltvPercent"
                        :class="{ limitExceeded: maxLtvReached }"
                        disabled
                    />
                    <span class="appendPercent">%</span>
                </div>
            </div>
        </div>

        <div class="col-2">
            <!-- Est Monthly Payment -->
            <div class="input-group">
                <div class="label-block">
                    <label for="homePrice">Estimated Monthly Payment</label>
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
                <label for="propTax">Property Tax</label>
                <div class="feeInputBlock">
                    <span class="prependPlus">+</span>
                    <span class="prependDollar">$</span>
                    <input
                        type="text"
                        v-model="propertyTaxValidated"
                        id="propTax"
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
        <div class="col-3">
            <div class="chartWrapper">
                <div class="label-block">
                    <span>$</span>
                    <span class="estPmt-value doughnut-label">{{ estMonthlyPmt.toLocaleString() }}</span>
                    <span>Monthly Payment</span>
                </div>
                <doughnut-chart
                    :chart-data="chartData"
                    :options="options"
                    class="doughnut-chart"
                />
            </div>
            <div
                v-if="maxLtvReached"
                class="ltvWarning"
            >
                Cashing out at ${{ cashOut }} will exceed the maximum combined loan-to-value of 80%. Try
                adjusting your cash out amount.
            </div>
        </div>
    </div>
</template>

<script>
import DoughnutChart from "./DoughnutChart.vue";

export default {
    name: "RefinanceCalculator",
    components: {
        "doughnut-chart": DoughnutChart,
    },
    mounted() {
        this.update();
        this.fillChartData();
    },
    data() {
        return {
            homeValue: "250000",
            mortBalance: "200000",
            cashOut: "0",
            ltv: "80",
            estMonthlyPmt: "",
            rate: 4.25,
            loanLength: 360,
            homeInsurance: "73",
            propertyTax: "250",
            hoaFees: "0",
            fees: "0",
            maxLtvReached: false,
            chartData: {},
            options: {
                legend: false,
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 70,
            },
        };
    },
    methods: {
        fillChartData() {
            this.chartData = {
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
        },
        homeValueChanged() {
            if (this.homeValue > 0) {
                this.mortBalance = Math.round(
                    parseFloat(this.ltv / 100) * Number(this.homeValue) -
                        Number(this.cashOut)
                );
                this.update();
            }
        },
        cashoutChanged() {
            this.update();
        },
        update() {
            this.ltv = Math.round(
                ((Number(this.mortBalance) + Number(this.cashOut)) /
                    Number(this.homeValue)) *
                    100
            );
            if (this.ltv > 80) {
                this.maxLtvReached = true;
            } else {
                this.maxLtvReached = false;
            }
            this.fees =
                Number(this.hoaFees) +
                Number(this.homeInsurance) +
                Number(this.propertyTax);
            this.estMonthlyPmt = this.calcMonthlyPmt;
            this.fillChartData();
        },
    },
    computed: {
        calcMonthlyPmt() {
            let P = Number(this.mortBalance) + Number(this.cashOut);
            let r = parseFloat(this.rate / 1200);
            let n = parseInt(this.loanLength);

            return Math.round(
                r == 0
                    ? P / n + this.fees
                    : (P * (r * Math.pow(1 + r, n))) /
                          (Math.pow(1 + r, n) - 1) +
                          this.fees
            );
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
                "--val": this.homeValue,
            };
        },

        // real time input validation
        homeValueValidated: {
            get() {
                return this.homeValue;
            },

            set(value) {
                if (value.length > 7) {
                    this.homeValue = value.slice(0, -1);
                } else {
                    this.homeValue = value;
                }
                this.homeValue = this.homeValue.replace(/[^0-9]/g, "");
            },
        },
        mortBalanceValidated: {
            get() {
                return this.mortBalance;
            },

            set(value) {
                if (value.length > 7) {
                    this.mortBalance = value.slice(0, -1);
                } else {
                    this.mortBalance = value;
                }

                if (Number(value) > Number(this.homeValue)) {
                    this.mortBalance = this.homeValue;
                }

                this.mortBalance = this.mortBalance.replace(/[^0-9]/g, "");
            },
        },
        rateValidated: {
            get() {
                return this.rate;
            },

            set(value) {
                if (value.length > 5) {
                    this.rate = value.slice(0, -1);
                } else {
                    this.rate = value;
                }
                this.rate = this.rate.replace(/[^0-9.]/g, "");
            },
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
        cashOutValidated: {
            get() {
                return this.cashOut;
            },

            set(value) {
                if (value.length > 6) {
                    this.cashOut = value.slice(0, -1);
                } else {
                    this.cashOut = value;
                }

                this.cashOut = this.cashOut.replace(/[^0-9]/g, "");
            },
        },
    },
};
</script>

<style lang="scss" scoped>
.calculator {
    input.limitExceeded {
        color: $validation-error !important;
    }
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
        .mortBalance input {
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
                    padding-top: 5px;
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
            &.mortBalance {
                input:first-of-type {
                    width: 65%;
                }
                input:last-of-type {
                    width: 35%;
                }
            }
            .currencyGroup {
                display: flex;
            }
        }
        .dualLabel {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }
    }
    .col-3 {
        flex-wrap: wrap;
        .ltvWarning {
            margin-top: 1rem;
            color: red;
        }
    }
}
body.highContrast {
    .calculator {
        .appendPercent {
            color: $gray-copy-contrast;
        }
        .input-group {
            .label-block {
                span {
                    color: $gray-copy-contrast;
                }
                .estPmt-value {
                    color: $orange-contrast;
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
