const https = require('https');

module.exports = {
  name: "get_all_projects",
  title: "Get all projects",
  description: "",
  version: "v1",
  input: {
    title: "Get all projects",
    type: "object",
    properties: {
      mantisUrl: {
        title: "Mantis URL",
        type: "string",
        format: "url",
        minLength: 1,
        description: "Enter the URL of your Mantis application."
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      projects: {
        title: "Projects",
        type: "array"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { mantisUrl } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/projects`);
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
          } else if (res.statusCode === 200) {
            const parsedData = JSON.parse(data);
            output(null, { projects: parsedData.projects });
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
