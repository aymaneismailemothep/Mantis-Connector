const https = require('https');

module.exports = {
  name: "delete_a_project",
  title: "Delete a project",
  description: "",
  version: "v1",
  input: {
    title: "Delete a project",
    type: "object",
    properties: {
      mantisUrl: {
        title: "Mantis URL",
        type: "string",
        format: "url",
        minLength: 1,
        description: "Enter the URL of your Mantis application."
      },
      projectId: {
        title: "Project ID",
        type: "integer",
        minLength: 1,
        description: "Enter the Mantis project ID."
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
    const { projectId, mantisUrl } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/projects/${projectId}`);
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
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          if (res.statusCode === 401) {
            output('Unauthorized: Invalid API key. Please check your API key and try again.', null);
          } else if (res.statusCode === 404) {
            output(`Project not found: The project with ID ${projectId} could not be found. Please check the project ID and try again.`, null);
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
    req.end();
  }  
}
