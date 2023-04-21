const https = require('https');

module.exports = {
  name: "add_attachments_to_issue",
  title: "Add attachments to an issue",
  description: "",
  version: "v1",
  input: {
    title: "Add attachments to an issue",
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
      attachments: {
        title: "Attachments",
        type: "array",
        items: {
          type: "string",
          title: "Attachment" // Add this line
        },
        description: "Enter an array of base64 encoded attachments."
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      success: {
        title: "Success",
        type: "boolean"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { issueId, mantisUrl, attachments } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues/${issueId}/files`);
    const options = {
      method: 'POST',
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
            output(null, { success: true });
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

    const requestBody = JSON.stringify({ files: attachments });
    req.write(requestBody);
    req.end();
  }
}
