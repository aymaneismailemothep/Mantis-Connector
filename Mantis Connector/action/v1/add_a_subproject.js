const https = require('https');

module.exports = {
  name: "add_a_subproject",
  title: "Add a sub-project",
  description: "",
  version: "v1",
  input: {
    title: "Add a sub-project",
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
      },
      subproject: {
        title: "Subproject",
        type: "object",
        properties: {
          name: {
            title: "Subproject Name",
            type: "string",
            minLength: 1,
            description: "Enter the name of the subproject."
          }
        }
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      result: {
        title: "Result",
        type: "object"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { projectId, mantisUrl, subproject } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/projects/${projectId}/subprojects`);
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
            output(`Project not found: The project with ID ${projectId} could not be found. Please check the project ID and try again.`, null);
          } else if (res.statusCode === 201) {
            const parsedData = JSON.parse(data);
            output(null, { result: parsedData });
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
    req.write(JSON.stringify(subproject));
    req.end();
  }
}
