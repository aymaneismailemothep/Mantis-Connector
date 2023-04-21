const https = require('https');

module.exports = {
  name: "delete_an_issue",
  title: "Delete an issue",
  description: "",
  version: "v1",
  input: {
    title: "Delete an issue",
    type: "object",
    properties: {
      mantisUrl: {
        title: "Mantis URL",
        type: "string",
        format: "url",
        minLength: 1,
        description: "Enter the URL of your Mantis application."
      },
      issueId: {
        title: "Issue ID",
        type: "integer",
        minLength: 1,
        description: "Enter the Mantis issue ID."
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      message: {
        title: "Message",
        type: "string"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { issueId, mantisUrl } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues/${issueId}`);
    const options = {
      method: 'DELETE',
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      }
    };
    const req = https.request(options, (res) => {
      if (res.statusCode === 401) {
        output('Unauthorized: Invalid API key. Please check your API key and try again.', null);
      } else if (res.statusCode === 404) {
        output(`Issue not found: The issue with ID ${issueId} could not be found. Please check the issue ID and try again.`, null);
      } else if (res.statusCode === 204) {
        output(null, { message: `Issue with ID ${issueId} has been successfully deleted.` });
      } else {
        output(`Unexpected error: Received status code ${res.statusCode}. Please check the input and try again.`, null);
      }
    });
    req.on('error', (error) => {
      output(error, null);
    });
    req.end();
  }
}
