const https = require('https');

module.exports = {
  name: "create_a_project",
  title: "Create a project",
  description: "",
  version: "v1",
  input: {
    title: "Create a project",
    type: "object",
    properties: {
      mantisUrl: {
        title: "Mantis URL",
        type: "string",
        format: "url",
        minLength: 1,
        description: "Enter the URL of your Mantis application."
      },
      projectName: {
        title: "Project Name",
        type: "string",
        minLength: 1,
        description: "Enter the name of the project to be created."
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
    const { projectName, mantisUrl } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/projects`);
    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      }
    };

    const postData = JSON.stringify({
      name: projectName
    });

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          if (res.statusCode === 401) {
            output('Unauthorized: Invalid API key. Please check your API key and try again.', null);
          } else if (res.statusCode === 201) {
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
    req.write(postData);
    req.end();
  }
}
