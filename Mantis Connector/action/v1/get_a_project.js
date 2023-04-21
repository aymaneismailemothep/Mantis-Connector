const https = require('https');

module.exports = {
  name: "get_a_project",
  title: "Get a project",
  description: "",
  version: "v1",
  input: {
    title: "Get a project",
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
      project: {
        title: "Project",
        type: "object"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { projectId, mantisUrl } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/projects/${projectId}`);
    const options = {
      method: 'GET',
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
            const parsedData = JSON.parse(data);
            output(null, { project: parsedData });
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
