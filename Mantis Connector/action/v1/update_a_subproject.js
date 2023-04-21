const https = require('https');

module.exports = {
  name: "update_a_subproject",
  title: "Update a sub-project",
  description: "",
  version: "v1",
  input: {
    title: "Update a sub-project",
    type: "object",
    properties: {
      mantisUrl: {
        title: "Mantis URL",
        type: "string",
        format: "url",
        minLength: 1,
        description: "Enter the URL of your Mantis application."
      },
      subprojectId: {
        title: "Subproject ID",
        type: "integer",
        minLength: 1,
        description: "Enter the Mantis subproject ID."
      },
      subprojectData: {
        title: "Subproject Data",
        type: "object",
        properties: {
          // Add properties for the subproject data you want to update.
        },
        description: "Enter the subproject data to update."
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      subproject: {
        title: "Subproject",
        type: "object"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { subprojectId, mantisUrl, subprojectData } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/projects/${subprojectId}`);
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
            output(`Subproject not found: The subproject with ID ${subprojectId} could not be found. Please check the subproject ID and try again.`, null);
          } else if (res.statusCode === 200) {
            const parsedData = JSON.parse(data);
            output(null, { subproject: parsedData });
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
    req.write(JSON.stringify(subprojectData));
    req.end();
  }  
}
