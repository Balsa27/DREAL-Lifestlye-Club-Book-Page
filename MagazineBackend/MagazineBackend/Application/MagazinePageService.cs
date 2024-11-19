using MagazineBackend.Application.TransferObject.Request;
using MagazineBackend.Domain;
using MagazineBackend.Domain.Exception;
using MagazineBackend.Repository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace MagazineBackend.Application;

public class MagazinePageService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<MagazinePageService> _logger;
    private readonly SemaphoreSlim _uploadSemaphore;
    private readonly string _uploadPath;
    private const int MaxFileSizeMb = 10;
    private readonly IConfiguration _configuration;
    private readonly MagazineContext _db;

    private static readonly string[] AllowedTypes = //only support jpeg for now
    [
        "image/jpeg"
    ];

    public MagazinePageService(
        IMemoryCache cache,
        ILogger<MagazinePageService> logger,
        IWebHostEnvironment environment,
        IConfiguration configuration,
        MagazineContext db)
    {
        _cache = cache;
        _logger = logger;
        _configuration = configuration;
        _db = db;

        _uploadPath = configuration.GetValue<string>("Storage:UploadsPath"!)
                      ?? throw new InvalidOperationException("Storage:UploadsPath not configured");

        _uploadSemaphore = new SemaphoreSlim(3);

        EnsureDirectoryExists(_uploadPath);
    }

    public async Task<(string url, string fileName)> UploadMagazineImageAsync(UploadMagazineImageRequest request, Guid userId, string host)
    {
        try
        {
            await _uploadSemaphore.WaitAsync();

            if (request.File == null || request.File.Length == 0)
            {
                _logger.LogError("No file provided");
                throw new InvalidOperationException("No file provided");
            }

            if (request.File.Length > MaxFileSizeMb * 5 * 1024 * 1024)
            {
                _logger.LogError($"File size exceeds {MaxFileSizeMb}MB limit");
                throw new InvalidOperationException($"File size exceeds {MaxFileSizeMb}MB limit");
            }

            if (!AllowedTypes.Contains(request.File.ContentType.ToLower()))
            {
                _logger.LogError($"Invalid file type");
                throw new InvalidOperationException("Invalid file type");
            }

            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var magazine = await _db.Magazines
                    .Include(c => c.PageUrls)
                    .FirstOrDefaultAsync(m => m.Id == request.MagazineId && m.UserId == userId);

                if (magazine is null)
                {
                    _logger.LogError($"Magazine with the id: {request.MagazineId}, and userId: {userId} not found");
                    throw new EntityNotFoundException(typeof(Magazine));
                }

                var fileName = $"{magazine.Name}-{magazine.PageUrls.Count + 2}";
                var filePath = Path.Combine(_uploadPath, fileName);

                if (!File.Exists(filePath))
                {
                    await using (var stream = new FileStream(
                                     filePath,
                                     FileMode.Create,
                                     FileAccess.Write,
                                     FileShare.None))
                    {
                        await request.File.CopyToAsync(stream);
                    }

                    _logger.LogInformation("File {FileName} uploaded successfully to {Path}", fileName, filePath);
                }
                else
                {
                    _logger.LogInformation("File {FileName} already exists at {Path}, returning existing URL", fileName,
                        filePath);
                }

                var fullFilePath = $"{host}/{fileName}";

                magazine.PageUrls.Add(fullFilePath);
                _db.Update(magazine);
                await _db.SaveChangesAsync();
                
                _logger.LogInformation($"Added a new page to the magazine with the id: {magazine.Id}, pageUrl: {fullFilePath}");

                await transaction.CommitAsync();

                return (fullFilePath, fileName);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error uploading file");
            throw;
        }
        finally
        {
            _uploadSemaphore.Release();
        }
    }
    
    public async Task<(byte[] fileBytes, string contentType, string etag)?> GetMagazineImage(GetMagazineImageRequest request, Guid userId, string host)
    {
        var magazine = await _db.Magazines
            .AsNoTracking()
            .Include(m => m.PageUrls)
            .FirstOrDefaultAsync(m => m.Id == request.MagazineId && m.UserId == userId);

        if (magazine is null)
        {
            _logger.LogError($"Magazine with the id: {request.MagazineId} and userID: {userId} was not found while attempting to get teh magazine image.");
            throw new InvalidOperationException("Magazine not found.");
        }
        
        var fullPath = $"{host}/{request.RelativePath}".TrimEnd('/');

        if (!magazine.PageUrls.Contains(fullPath))
        {
            _logger.LogError($"Magazine with the id: {request.MagazineId} and userID: {userId} was not found while attempting to get teh magazine image.");
            throw new EntityNotFoundException(
                $"Page with the url: {request.RelativePath} was not found in the magazine with the id: {request.MagazineId} instantiated by the user with id: {userId}");
        }
        
        var cacheKey = $"img_{request.RelativePath}";

        if (_cache.TryGetValue<(byte[], string, string)>(cacheKey, out var cachedImage))
        {
            _logger.LogDebug("Cache hit for {Path}", request.RelativePath);
            return cachedImage;
        }

        if (!File.Exists(fullPath))
        {
            _logger.LogWarning("File not found at {Path}", fullPath);
            return null;
        }

        try
        {
            var bytes = await File.ReadAllBytesAsync(fullPath);
            var contentType = "image/jpeg";
            var etag = $"\"{Path.GetFileName(request.RelativePath)}\"";

            var result = (bytes, contentType, etag);

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromHours(1))
                .SetAbsoluteExpiration(TimeSpan.FromHours(24));

            if (bytes.Length > 5 * 1024 * 1024) // 5MB
            {
                cacheOptions.SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromHours(6));
            }

            cacheOptions.SetSize(bytes.Length);

            _cache.Set(cacheKey, result, cacheOptions);
            _logger.LogInformation("File {Path} cached", request.RelativePath);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading file {Path}", fullPath);
            return null;
        }
    }

    private void EnsureDirectoryExists(string path)
    {
        try
        {
            if (Directory.Exists(path)) return;
            Directory.CreateDirectory(path);
            _logger.LogInformation("Created directory: {Path}", path);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create directory at {Path}", path);
            throw new InvalidOperationException($"Failed to create directory at {path}", ex);
        }
    }
}