namespace MagazineBackend.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string GoogleToken { get; set; }
    
    //Entity framework navigation prop
    public List<Magazine> Magazines { get; set; } = new List<Magazine>();
}