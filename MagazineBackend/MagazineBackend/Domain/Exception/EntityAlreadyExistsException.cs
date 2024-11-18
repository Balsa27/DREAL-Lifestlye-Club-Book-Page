namespace MagazineBackend.Domain.Exception;

public class EntityAlreadyExistsException : System.Exception
{
    public EntityAlreadyExistsException(Type type, string param, string value)
        : base($"Entity of type '{type.Name}' already exists with the overlaping {param}: {value}.")
    {
    }
}