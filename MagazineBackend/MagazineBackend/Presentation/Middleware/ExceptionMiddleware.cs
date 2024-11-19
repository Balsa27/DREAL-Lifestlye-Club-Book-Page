using MagazineBackend.Domain.Exception;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace MagazineBackend.Presentation.Middleware;

public class ExceptionMiddleware(RequestDelegate next, IWebHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            UnauthorizedAccessException _ => 
                (StatusCodes.Status401Unauthorized, "Unauthorized access"),
                
            EntityNotFoundException _ => 
                (StatusCodes.Status404NotFound, exception.Message),
                
            EntityAlreadyExistsException _ => 
                (StatusCodes.Status409Conflict, exception.Message),
                
            AccessViolationException _ => 
                (StatusCodes.Status403Forbidden, "Access forbidden"),
                
            InvalidOperationException _ when exception.Message.Contains("File size exceeds") => 
                (StatusCodes.Status413PayloadTooLarge, exception.Message),
                
            InvalidOperationException _ when exception.Message.Contains("Invalid file type") => 
                (StatusCodes.Status415UnsupportedMediaType, exception.Message),
                
            InvalidOperationException _ when exception.Message.Contains("Storage:UploadsPath not configured") => 
                (StatusCodes.Status500InternalServerError, "Server storage configuration error"),
                
            InvalidOperationException _ => 
                (StatusCodes.Status400BadRequest, exception.Message),
                
            IOException _ when exception.Message.Contains("disk space") => 
                (StatusCodes.Status507InsufficientStorage, "Insufficient storage space"),
                
            IOException _ => 
                (StatusCodes.Status500InternalServerError, "File system error occurred"),
                
            DbUpdateException _ => 
                (StatusCodes.Status500InternalServerError, "Database error occurred"),
                
            OperationCanceledException _ => 
                (StatusCodes.Status408RequestTimeout, "Operation timed out"),
                
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        context.Response.StatusCode = statusCode;

        var result = JsonConvert.SerializeObject(new 
        { 
            error = message,
            details = environment.IsDevelopment() ? exception.ToString() : null
        });
        
        return context.Response.WriteAsync(result);
    }
}