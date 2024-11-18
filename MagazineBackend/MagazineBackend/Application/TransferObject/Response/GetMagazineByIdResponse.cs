namespace MagazineBackend.Application.TransferObject.Response;

public class GetMagazineByIdResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public List<string> ImageUrls { get; set; }
}