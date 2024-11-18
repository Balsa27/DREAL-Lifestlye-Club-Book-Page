namespace MagazineBackend.Domain.Exception;

public class EntityNotFoundException : System.Exception
{
    public EntityNotFoundException()
        : base("Entity was not found.")
    {
    }

    public EntityNotFoundException(Type type)
        : base($"Entity of type '{type.Name}' was not found.")
    {
    }

    public EntityNotFoundException(Type type, Guid id)
        : base($"Entity of type '{type.Name}' with id '{id.ToString()}' was not found.")
    {
    }
}