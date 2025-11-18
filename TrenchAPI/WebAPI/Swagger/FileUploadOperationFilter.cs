using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace TrenchAPI.WebAPI.Swagger;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var formFileParameters = context.MethodInfo
            .GetParameters()
            .Where(parameter =>
                parameter.ParameterType == typeof(IFormFile) ||
                parameter.ParameterType == typeof(IFormFileCollection))
            .ToArray();

        if (formFileParameters.Length == 0)
        {
            return;
        }

        var schema = new OpenApiSchema
        {
            Type = "object",
            Properties = new Dictionary<string, OpenApiSchema>(),
            Required = new HashSet<string>()
        };

        foreach (var parameter in formFileParameters)
        {
            if (!string.IsNullOrWhiteSpace(parameter.Name))
            {
                schema.Properties[parameter.Name] = new OpenApiSchema
                {
                    Type = "string",
                    Format = "binary"
                };

                if (!parameter.IsOptional)
                {
                    schema.Required.Add(parameter.Name);
                }
            }
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Content =
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = schema
                }
            }
        };
    }
}

