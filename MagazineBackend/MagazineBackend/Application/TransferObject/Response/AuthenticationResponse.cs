namespace MagazineBackend.Application.DataTransferObjects.Response;

public class AuthenticationResponse
{
    public string Jwt { get; set; }
    public Guid Id { get; set; }
}