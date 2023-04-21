const https = require('https');

module.exports = {
  name: "create_an_issue",
  title: "Create an issue",
  description: "",
  version: "v1",
  input: {
    title: "Create an issue",
    type: "object",
    properties: {
      mantisUrl: {
        title: "Mantis URL",
        type: "string",
        format: "url",
        minLength: 1,
        description: "Enter the URL of your Mantis application."
      },
      summary: {
        title: "Summary",
        type: "string",
        minLength: 1,
        description: "Enter the summary of the issue."
      },
      description: {
        title: "Description",
        type: "string",
        minLength: 1,
        description: "Enter the description of the issue."
      },
      additional_information: {
        title: "Additional Information",
        type: "string",
        minLength: 1,
        description: "Enter additional information about the issue."
      },
      project: {
        title: "Project",
        type: "object",
        properties: {
          id: {
            title: "Project ID",
            type: "integer",
            minLength:1,
          },
          name: {
            title: "Project Name",
            type: "string",
            minLength: 1,
          }
        }
      },
      category: {
        title: "Category",
        type: "object",
        properties: {
          id: {
            title: "Category ID",
            type: "integer",
          },
          name: {
            title: "Category Name",
            type: "string",
            minLength: 1,
          }
        }
      },
      handler: {
        title: "Handler",
        type: "object",
        properties: {
          name: {
            title: "Handler Name",
            type: "string",
            minLength: 1
          }
        }
    },
    view_state: {
      title: "view_state",
      type: "object",
      properties: {
        id: {
          title: "view ID",
          type: "integer",
          minLength:1,
        },
        name: {
          title: "view Name",
          type: "string",
          minLength: 1,
        }
      }
    }  
  }
},
  output: {
    title: "output",
    type: "object",
    properties: {
      issue: {
        title: "Issue",
        type: "object"
      }
    }
  },
  mock_input: {},
  execute: function (input, output) {
    const {summary, description, additional_information, project, category, handler, view_state, mantisUrl } = input;
    const apiKey = input.auth.api_key;
    const url = new URL(`${mantisUrl}/api/rest/issues/`);
    const issueData = JSON.stringify({
      summary: summary,
      description: description,
      additional_information: additional_information,
      project:project,
      category:category,
      handler:handler,
      view_state:view_state
    });
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
          } else if (res.statusCode === 201) {
            const parsedData = JSON.parse(data);
            output(null, { issue: parsedData });
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
    req.write(issueData);
    req.end();
  }
}
