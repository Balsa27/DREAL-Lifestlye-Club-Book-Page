namespace MagazineBackend.Application.TransferObject.Request;

public class UploadMagazineImageRequest
{
    public IFormFile File { get; set; }
    public Guid MagazineId { get; set; }
}