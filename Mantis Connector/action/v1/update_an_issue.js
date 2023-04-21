const https = require('https');

module.exports = {
  name: "update_an_issue",
  title: "Update an issue",
  description: "",
  version: "v1",
  input: {
    title: "Update an issue",
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
      },
      issueData: {
        title: "Issue Data",
        type: "object",
        description: "Enter the data to update the issue.",
        properties: {
          summary: {
            title: "Summary",
            type: "string",
            description: "Enter the updated summary for the issue."
          },
          description: {
            title: "Description",
            type: "string",
            description: "Enter the updated description for the issue."
          },
          status: {
            title: "Status",
            type: "string",
            description: "Enter the updated status for the issue."
          }
          // Add more fields as needed
        }
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      issue: {
        title: "Issue",
        type: "object"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { issueId, mantisUrl, issueData } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues/${issueId}`);
    const options = {
      method: 'PATCH',
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          if (res.statusCode === 401) {
            output('Unauthorized: Invalid API key. Please check your API key and try again.', null);
          } else if (res.statusCode === 404) {
            output(`Issue not found: The issue with ID ${issueId} could not be found. Please check the issue ID and try again.`, null);
          } else if (res.statusCode === 200) {
            const parsedData = JSON.parse(data);
            output(null, { issue: parsedData });
          } else {
            output(`Unexpected error: Received status code ${res.statusCode}. Please check the input and try again.`, null);
          }
        } catch (error) {
          output(error, null);
        }
      });
    });
    req.on('error', (error) => {
      output(error, null);
    });
    req.write(JSON.stringify(issueData));
    req.end();
  }
}
