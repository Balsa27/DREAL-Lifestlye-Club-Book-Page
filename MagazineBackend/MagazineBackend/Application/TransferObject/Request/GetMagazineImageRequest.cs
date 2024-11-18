namespace MagazineBackend.Application.TransferObject.Request;

public class GetMagazineImageRequest
{
    public Guid MagazineId { get; set; }
    public string RelativePath { get; set; }
}