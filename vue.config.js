module.exports = {
    css: {
        loaderOptions: {
            scss: {
                prependData: `
                    @import "@/scss/utility/_variables.scss";
                    @import "@/scss/utility/_mixins.scss";
                `,
                // sourceMap: true
            },
        },
        // sourceMap: true
    },
    configureWebpack: {
        resolve: {
            extensions: [".sass", ".scss", ".css", ".js", ".json"],
        },
        devtool: "source-map",
    },
};
