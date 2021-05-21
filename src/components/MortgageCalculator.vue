<template>
    <div class="calculator">

        <div class="calculator__wrapper">
            <div class="calcNavbar">
                <div class="calcNavbar__calcs">
                    <span
                        :class="['calcNavbar__link', { active: loanType == 'Purchase' }]"
                        @click="setLoanType('Purchase')"
                    >Purchase</span>

                    <span
                        :class="['calcNavbar__link', {active: loanType == 'Refinance' }]"
                        @click="setLoanType('Refinance'), setUtility('Breakdown')"
                    >Refinance</span>
                </div>
                <div class="calcNavbar__views">
                    <span
                        :class="['calcNavbar__link', { active: utility == 'Breakdown' }]"
                        @click="setUtility('Breakdown')"
                    >Payment Breakdown</span>

                    <span
                        v-if="loanType == 'Purchase'"
                        :class="['calcNavbar__link', { active: utility == 'Amortization' }]"
                        @click="setUtility('Amortization')"
                    >Amortization Schedule</span>
                </div>
            </div>

            <purchase-calculator v-if="loanType == 'Purchase'" />
            <refinance-calculator v-if="loanType == 'Refinance'" />
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import PurchaseCalculator from "./PurchaseCalculator.vue";
import RefinanceCalculator from "./RefinanceCalculator.vue";

export default {
    name: "MortgageCalculator",
    components: {
        "purchase-calculator": PurchaseCalculator,
        "refinance-calculator": RefinanceCalculator,
    },
    computed: {
        ...mapState(["loanType", "utility"]),
    },
    methods: {
        ...mapActions(["setLoanType", "setUtility"]),
    },
};
</script>

<style lang="scss">
// cross browser range sliders
$track-w: 100%;
$track-h: 0.7em;
$thumb-d: 1.7em;
$track-c: rgba(255, 255, 255, 0.3);
$fill-c: $main-font-color;

@mixin track($fill: 0) {
    box-sizing: border-box;
    border: 1px solid $gray-icon;
    border-radius: 15px;
    width: $track-w;
    height: $track-h;
    background: $track-c;

    @if $fill == 1 {
        .js & {
            background: linear-gradient($fill-c, $fill-c)
                0 /
                var(--sx)
                100%
                no-repeat
                $track-c;
        }
    }
}

@mixin fill() {
    height: $track-h;
    background: $fill-c;
}

@mixin thumb() {
    box-sizing: border-box;
    border: none;
    width: $thumb-d;
    height: $thumb-d;
    border-radius: 50%;
    background-color: $primary-color;
}

.calculator {
    padding: 6rem;
    label {
        color: $gray-icon;
    }
    &__wrapper {
        width: 100%;
        margin: 0 auto;
        @include breakpoint(desktop) {
            width: unset;
            margin-right: 5rem;
        }
        @include breakpoint(ipadPro) {
            width: unset;
            margin-right: 0;
        }
    }
    .ruoffLogo {
        width: 19rem;
        margin-bottom: 2rem;
    }
    .calcNavbar {
        display: flex;
        background-color: #fff;
        justify-content: space-between;
        border-bottom: 1px solid $gray-copy;
        padding: 0 0 1rem;
        &__link {
            position: relative;
            font-size: 1.7rem;
            letter-spacing: 1.2px;
            color: $gray-icon;
            padding-bottom: 1.2rem;
            cursor: pointer;
            @include breakpoint(tablet-land) {
                letter-spacing: initial;
            }
            &:not(:last-child) {
                margin-right: 2rem;
                @media screen and (max-width: 647px) {
                    display: block;
                    margin-bottom: 2rem;
                }
            }
            &.active {
                color: $main-font-color !important; // due to high contrast styles
                font-weight: 600;
                &:before {
                    content: "";
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 5px;
                    background-color: $primary-color;
                }
            }
        }
    }
    &__views-wrapper {
        display: flex;
        margin-top: 4rem;
        @include breakpoint(ipadPro) {
            flex-wrap: wrap;
        }
    }
    select,
    input {
        font-family: Avenir, Helvetica, sans-serif;
    }
    .col-2 {
        width: 43%;
        padding: 0 4%;
        @include breakpoint(ipadPro) {
            width: 55%;
            padding-right: 0;
            padding-left: 0;
        }
        @include breakpoint(tablet-land) {
            width: 100%;
            margin-top: 0;
            order: 3;
        }
        .principalAndInterest,
        .homeInsurance,
        .propTax,
        .hoaFees {
            display: flex;
            align-items: center;
            border-bottom: 1px solid $gray-icon;
            input {
                height: 4.5rem;
                text-align: right;
                padding-right: 1rem;
                color: $main-font-color;
                font-weight: 600;
                font-size: 2.2rem;
                width: 100%;
            }
            .feeInputBlock {
                position: relative;
                margin-left: auto;
                display: flex;
                align-items: center;
                min-width: 130px;
                max-width: 200px;
            }
            span.colorCode {
                display: inline-block;
                height: 25px;
                width: 25px;
                min-width: 25px;
                margin-right: 1.5rem;
                border-radius: 5px;
            }
            span.value {
                margin-left: auto;
                font-size: 2.2rem;
                font-weight: 600;
            }
            .prependDollar {
                left: 3.5rem;
                color: $gray-icon;
            }
            .prependPlus {
                color: $gray-icon;
                margin-right: 1rem;
            }
        }
        .principalAndInterest {
            margin-top: 4rem;
            padding-bottom: 2rem;
            span.colorCode {
                background-color: $main-font-color;
            }
        }
        .homeInsurance {
            padding: 1.5rem 0;
            span.colorCode {
                background-color: $quinary-color;
            }
        }
        .propTax {
            padding: 1.5rem 0;
            span.colorCode {
                background-color: $quaternary-color;
            }
        }
        .hoaFees {
            padding: 1.5rem 0;
            span.colorCode {
                background-color: $tertiary-color;
            }
        }
        .label-block {
            @include breakpoint(tablet-land) {
                display: none !important;
            }
        }
    }
    .col-3 {
        width: 29%;
        display: flex;
        @include breakpoint(ipadPro) {
            display: flex;
            width: 100%;
        }
        @include breakpoint(tablet-land) {
            width: 100%;
            order: 2;
        }
        .chartWrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            @include breakpoint(ipadPro) {
                display: flex;
                justify-content: center;
                width: 45%;
                margin-top: 2rem;
                // height: 250px;
            }
            @include breakpoint(tablet-land) {
                width: 100%;
                // height: 300px;
            }
            .label-block {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: top;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                span:first-child {
                    margin: 0.5rem 0.5rem 0 0;
                }
                span:last-child {
                    width: 100%;
                    color: $gray-icon;
                    text-align: center;
                }
            }
            .doughnut-label {
                color: $secondary-color;
                font-weight: 700;
                font-size: 4rem;
            }
            .doughnut-chart {
                height: 350px;
                max-width: 100%;
                @include breakpoint(ipadPro) {
                    height: 275px;
                }
            }
        }
    }
}

.calculator [type="range"] {
    &,
    &::-webkit-slider-thumb {
        -webkit-appearance: none;
    }
    --range: calc(var(--max) - var(--min));
    --ratio: calc((var(--val) - var(--min)) / var(--range));
    --sx: calc(0.5 *#{$thumb-d} + var(--ratio) * (100% - #{$thumb-d}));
    margin: 0;
    padding: 0;
    width: $track-w;
    height: $thumb-d;
    background: transparent;
    font: 1em/1 arial, sans-serif;

    &:focus,
    &:active {
        outline: none;
    }
    &::-webkit-slider-runnable-track {
        @include track(1);
    }
    &::-moz-range-track {
        @include track;
    }
    &::-ms-track {
        @include track;
        color: transparent;
    }

    &::-moz-range-progress {
        @include fill;
    }
    &::-ms-fill-lower {
        @include fill;
    }

    &::-webkit-slider-thumb {
        margin-top: 0.5 * ($track-h - $thumb-d);
        @include thumb;
    }
    &::-moz-range-thumb {
        @include thumb;
    }
    &::-ms-thumb {
        margin-top: 0;
        @include thumb;
    }

    &::-ms-tooltip {
        display: none;
    }
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type="number"] {
    -moz-appearance: textfield;
}
</style>
