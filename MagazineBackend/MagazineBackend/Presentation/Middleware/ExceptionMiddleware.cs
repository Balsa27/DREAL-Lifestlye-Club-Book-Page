using MagazineBackend.Domain.Exception;
using Newtonsoft.Json;

namespace MagazineBackend.Presentation.Middleware;

public class ExceptionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (System.Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private static Task HandleExceptionAsync(HttpContext context, System.Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            UnauthorizedAccessException _ => StatusCodes.Status401Unauthorized,
            EntityNotFoundException _ => StatusCodes.Status404NotFound,
            EntityAlreadyExistsException _ => StatusCodes.Status409Conflict,
            AccessViolationException _ => StatusCodes.Status403Forbidden,
            InvalidOperationException _ => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
        context.Response.StatusCode = statusCode;

        var result = JsonConvert.SerializeObject(new { error = exception.Message });
        return context.Response.WriteAsync(result);
    }
}