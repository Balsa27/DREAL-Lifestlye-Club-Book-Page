using Google.Apis.Auth;
using MagazineBackend.Application.DataTransferObjects.Request;
using MagazineBackend.Application.DataTransferObjects.Response;
using MagazineBackend.Domain;
using MagazineBackend.Domain.Abstraction;
using MagazineBackend.Repository;
using Microsoft.EntityFrameworkCore;

namespace MagazineBackend.Application;

public class AuthenticationService(IJwtService jwtService, ILogger<AuthenticationService> logger, IConfiguration configuration, MagazineContext db)
{
    public async Task<AuthenticationResponse> AuthenticateGoogleUserAsync(GoogleTokenRequest request)
    {
        logger.LogInformation($"Starting the Google validation process for the user with the token: {request.GoogleToken}");
        
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new [] {configuration.GetValue<string>("Google:Audience"!)}
        };
        
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.GoogleToken, settings);
        
        logger.LogInformation($"Validated payload for the user with the token: {request.GoogleToken}");
        
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == payload.Email);
        
        logger.LogInformation($"Validated payload for the user with the token: {request.GoogleToken}");

        if (user is null)
        {
            logger.LogInformation($"User was not found, creating a new account: {request.GoogleToken} email: {payload.Email}");

            user = new User
            {
                Id = Guid.NewGuid(),
                Email = payload.Email,
                Name = payload.Name,
                GoogleToken = request.GoogleToken,
            };

            db.Users.Add(user);

            logger.LogInformation($"User added to the dbset: {request.GoogleToken} email: {payload.Email}");
        }
        else
        {
            user.GoogleToken = request.GoogleToken;
        }

        await db.SaveChangesAsync();

        logger.LogInformation($"User added to the database: {request.GoogleToken} email: {payload.Email}");

        var token = jwtService.GenerateJwt(user);
        
        logger.LogInformation($"Generating a jwt: {request.GoogleToken} email: {payload.Email}");

        return new AuthenticationResponse
        {
            Id = user.Id,
            Jwt = token
        };
    }
}