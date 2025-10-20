using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;

public class ApiKeyAuthAttribute : Attribute, IAsyncActionFilter
{
    private const string API_KEY_HEADER_NAME = "KEY";
    private const string API_KEY = "ichliebetrench"; 

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(API_KEY_HEADER_NAME, out var extractedApiKey) ||
            extractedApiKey != API_KEY)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        await next();
    }
}
