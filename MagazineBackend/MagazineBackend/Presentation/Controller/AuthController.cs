using MagazineBackend.Application;
using MagazineBackend.Application.DataTransferObjects.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MagazineBackend.Presentation.Controller;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController(AuthenticationService service) : MagazineControllerBase
{
    [HttpPost]
    public async Task<IActionResult> GoogleSignInAsync(GoogleTokenRequest request)
    {
        var response = await service.AuthenticateGoogleUserAsync(request);
        return Ok(response);
    }
}