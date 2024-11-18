namespace MagazineBackend.Presentation.Middleware;

public class TimestampMiddleware(RequestDelegate next, ILogger<TimestampMiddleware> logger)
{
    private const string TimestampHeaderKey = "X-Request-Timestamp";
    private const string ProcessingTimeHeaderKey = "X-Processing-Time";

    public async Task InvokeAsync(HttpContext context)
    {
        if (IsSwaggerResource(context.Request.Path))
        {
            await next(context);
            return;
        }
        
        var requestTimestamp = DateTime.UtcNow;
        context.Request.Headers[TimestampHeaderKey] = requestTimestamp.ToString("o");

        var watch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            await next(context);
        }
        finally
        {
            watch.Stop();

            if (!context.Response.HasStarted)
            {
                context.Response.Headers[TimestampHeaderKey] = requestTimestamp.ToString("o");
                context.Response.Headers[ProcessingTimeHeaderKey] = $"{watch.ElapsedMilliseconds}ms";
            }
            else
            {
                logger.LogWarning(
                    "Could not add timestamp headers as response has already started. Request path: {Path}", 
                    context.Request.Path);
            }
        }
    }
    
    private static bool IsSwaggerResource(PathString path)
    {
        return path.StartsWithSegments("/swagger") || 
               path.Value?.EndsWith(".js") == true || 
               path.Value?.EndsWith(".css") == true;
    }
}