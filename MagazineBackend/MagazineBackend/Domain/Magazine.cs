namespace MagazineBackend.Domain;

public class Magazine
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public List<string> PageUrls { get; set; }
    public DateTime CreatedAt { get; set; }
    
    //Entity framework navigation prop
    public User User { get; set; }
}