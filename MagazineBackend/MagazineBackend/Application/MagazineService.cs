using MagazineBackend.Domain;
using MagazineBackend.Domain.Exception;
using MagazineBackend.Repository;
using Microsoft.EntityFrameworkCore;

namespace MagazineBackend.Application;

public class MagazineService(ILogger<MagazineService> logger, MagazineContext db)
{
    public async Task DeleteMagazine(Guid magazineId, Guid userId)
    {
        logger.LogInformation($"Starting deletion for the magazine with the Id: {magazineId}, UserId: {userId}");

        var magazine = await db.Magazines.FirstOrDefaultAsync(m => m.Id == magazineId);

        if (magazine is null)
        {
            logger.LogError($"Could not find the magazine with the id: {magazineId}, userId: {userId}");
            throw new EntityNotFoundException(typeof(Magazine), magazineId);
        }

        db.Remove(magazine);
    }

    public async Task CreateMagazine()
    {
        
    }

    public async Task AddMagazineImageAsync()
    {
        
    }
}