using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MagazineBackend.Domain;
using MagazineBackend.Domain.Abstraction;
using Microsoft.IdentityModel.Tokens;

namespace MagazineBackend.Application;

public class JwtService(IConfiguration configuration) : IJwtService
{
    public string GenerateJwt(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"!]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
        };

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"!],
            audience: configuration["Jwt:Audience"!],
            claims: claims,
            expires: DateTime.Now.AddMinutes(120),
            signingCredentials: credentials);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        
        return tokenString;
    }
}