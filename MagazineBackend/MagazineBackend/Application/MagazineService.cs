using MagazineBackend.Application.TransferObject.Request;
using MagazineBackend.Application.TransferObject.Response;
using MagazineBackend.Domain;
using MagazineBackend.Domain.Exception;
using MagazineBackend.Repository;
using Microsoft.EntityFrameworkCore;

namespace MagazineBackend.Application;

public class MagazineService(ILogger<MagazineService> logger, MagazineContext db)
{
    public async Task DeleteMagazineAsync(Guid magazineId, Guid userId)
    {
        logger.LogInformation($"Starting deletion for the magazine with the Id: {magazineId}, UserId: {userId}");

        var magazine = await db.Magazines.FirstOrDefaultAsync(m => m.Id == magazineId);

        if (magazine is null)
        {
            logger.LogError($"Could not find the magazine with the id: {magazineId}, userId: {userId}");
            throw new EntityNotFoundException(typeof(Magazine), magazineId);
        }

        db.Remove(magazine);
        await db.SaveChangesAsync();
        
        logger.LogInformation($"Deleted the  magazine with the id: {magazineId}, UserId: {userId}");
    }

    public async Task CreateMagazineAsync(CreateMagazineRequest request, Guid userId)
    {
        logger.LogInformation($"Starting creation of a new magazine instantiated by, UserId: {userId}");

        var magazine = new Magazine
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        if (await db.Magazines.AnyAsync(m => m.Name == request.Name))
        {
            logger.LogError($"Magazine with the same name already exists.");
            throw new EntityAlreadyExistsException(typeof(Magazine), nameof(magazine.Name), magazine.Name);
        }

        db.Add(magazine);
        await db.SaveChangesAsync();
        logger.LogInformation($"Created a new magazine for the user, UserId: {userId}");
    }

    public async Task<GetMagazineByIdResponse?> GetMagazineByIdAsync(Guid magazineId, Guid userId)
    {
        var magazine = await db.Magazines.FirstOrDefaultAsync(c => c.Id == magazineId);

        if (magazine is null)
        {
            return null;
        }

        if (magazine.UserId != userId)
        {
            logger.LogError($"Magazine does not belong to the user: {magazineId}, userId: {userId}");
            throw new InvalidOperationException("Magazine does not belong to the user");
        }

        return new GetMagazineByIdResponse
        {   
            Id = magazineId,
            Name = magazine.Name,
            ImageUrls = magazine.PageUrls,
            CreatedAtUtc = magazine.CreatedAt
        };
    }
    
    public async Task<IEnumerable<GetMagazineByIdResponse>> GetAllUserMagazinesAsync(Guid userId) =>
        await db.Magazines
            .Where(c => c.UserId == userId)
            .Select(magazine => new GetMagazineByIdResponse 
            { 
                Id = magazine.Id,
                Name = magazine.Name,
                ImageUrls = magazine.PageUrls,
                CreatedAtUtc = magazine.CreatedAt
            })
            .ToListAsync();
}