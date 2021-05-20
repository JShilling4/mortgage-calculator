import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        loanType: "Purchase",
        utility: "Breakdown",
    },
    mutations: {
        SET_LOAN_TYPE(state, loanType) {
            state.loanType = loanType;
        },
        SET_UTILITY(state, utility) {
            state.utility = utility;
        }
    },
    actions: {
        setLoanType({commit}, loanType) {
            commit("SET_LOAN_TYPE", loanType);
        },
        setUtility({commit}, utility) {
            commit("SET_UTILITY", utility);
        }
    },
    getters: {},
});
