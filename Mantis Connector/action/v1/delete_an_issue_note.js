const https = require('https');

module.exports = {
  name: "delete_an_issue_note",
  title: "Delete an issue note",
  description: "",
  version: "v1",
  input: {
    title: "Delete an issue note",
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
      noteId: {
        title: "Note ID",
        type: "integer",
        minLength: 1,
        description: "Enter the ID of the note to be deleted."
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
    const { issueId, mantisUrl, noteId } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues/${issueId}/notes/${noteId}`);
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
        output(`Note not found: The note with ID ${noteId} for issue ID ${issueId} could not be found. Please check the IDs and try again.`, null);
      } else if (res.statusCode === 200) {
        output(null, { success: true });
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
