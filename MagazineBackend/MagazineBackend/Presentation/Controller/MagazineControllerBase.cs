using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace MagazineBackend.Presentation.Controller;

public class MagazineControllerBase : ControllerBase
{
    protected Guid UserId => GetCurrentUserId();
    protected string Host => GetHostName();

    private string GetHostName()
    {
        var request = HttpContext.Request;
        return $"{request.Scheme}://{request.Host}";
    }

    private Guid GetCurrentUserId()
    {
        var user = HttpContext?.User;
        
        if (user?.Identity != null && (user == null || !user.Identity.IsAuthenticated))
            throw new UnauthorizedAccessException("User is not authenticated.");

        var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier);
        
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            return userId;

        throw new AccessViolationException("User ID is missing from token.");
    }
}