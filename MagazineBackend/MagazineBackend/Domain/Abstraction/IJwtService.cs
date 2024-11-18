namespace MagazineBackend.Domain.Abstraction;

public interface IJwtService
{
    string GenerateJwt(User user);
}