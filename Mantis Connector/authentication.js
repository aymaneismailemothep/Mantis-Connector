module.exports = {
	label: "Connect to Mantis",
	mock_input: {
		api_key: ""
	},
	validate: function (input, output) {
		output(null, true);
	}
}