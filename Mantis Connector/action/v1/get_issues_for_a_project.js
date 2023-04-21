const https = require('https');

module.exports = {
  name: "get_issues_for_a_project",
  title: "Get issues for a project",
  description: "",
  version: "v1",
  input: {
    title: "Get issues for a project",
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
      page: {
        title: "Page",
        type: "integer",
        minimum: 1,
        description: "Enter the page number."
      },
      pageSize: {
        title: "Page Size",
        type: "integer",
        minimum: 1,
        description: "Enter the number of items per page."
      }
    }
  },
  output: {
    title: "output",
    type: "object",
    properties: {
      issues: {
        title: "Issues",
        type: "array",
        items: {
          type: "object"
        }
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const { projectId, mantisUrl, page, pageSize } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues`);
    url.searchParams.append('project_id', projectId);
    url.searchParams.append('page_size', pageSize);
    url.searchParams.append('page', page);

    const options = {
      method: 'GET',
      hostname: url.hostname,
      path: url.pathname + url.search,
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
            output(null, { issues: parsedData.issues });
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
