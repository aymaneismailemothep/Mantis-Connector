const https = require('https');

module.exports = {
  name: "create_an_issue_note",
  title: "Create an issue note",
  description: "",
  version: "v1",
  input: {
    title: "Create an issue note",
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
      note: {
        title: "Note",
        type: "string",
        minLength: 1,
        description: "Enter the note you want to add to the issue."
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      note: {
        title: "Note",
        type: "object"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { issueId, mantisUrl, note } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues/${issueId}/notes`);
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
          } else if (res.statusCode === 201) {
            const parsedData = JSON.parse(data);
            output(null, { note: parsedData });
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

    req.write(JSON.stringify({ text: note }));
    req.end();
  }  
}
